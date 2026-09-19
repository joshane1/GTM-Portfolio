"""Independent integrity and case-metric checks for generated core CSVs."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta
from decimal import Decimal
from pathlib import Path


FILES = {
    "crm_accounts": ("raw/crm", 240, "account_id"),
    "crm_contacts": ("raw/crm", 720, "contact_id"),
    "crm_owners": ("raw/crm", 16, "owner_id"),
    "crm_opportunities": ("raw/crm", 240, "opp_id"),
    "crm_opportunity_source_links": ("raw/crm", 180, "source_link_id"),
    "crm_opportunity_stage_events": ("raw/crm", 900, "stage_event_id"),
    "crm_opportunity_field_events": ("raw/crm", 450, "field_event_id"),
    "mkt_inquiries": ("raw/marketing", 960, "inquiry_id"),
    "mkt_touches": ("raw/marketing", 3000, "touch_id"),
    "mkt_campaigns": ("raw/marketing", 24, "campaign_id"),
    "fin_customers": ("raw/finance", 90, "billing_customer_id"),
    "fin_subscriptions": ("raw/finance", 100, "subscription_id"),
    "fin_monthly_service_revenue": ("raw/finance", 850, "revenue_line_id"),
    "identity_account_links": ("raw/identity", 90, "link_id"),
}
OPEN_STAGES = {"DISCOVERY", "EVALUATION", "PROPOSAL", "NEGOTIATION"}
VALID_STAGES = OPEN_STAGES | {"CLOSED_WON", "CLOSED_LOST"}
APR_END = datetime.fromisoformat("2026-04-30T23:59:59+00:00")
JUN_END = datetime.fromisoformat("2026-06-30T23:59:59+00:00")


def moment(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def validate(data: Path) -> dict[str, object]:
    tables = {}
    for name, (folder, count, key) in FILES.items():
        path = data / folder / f"{name}.csv"
        check(path.is_file(), f"Missing table: {path}")
        table = rows(path)
        check(len(table) == count, f"{name}: {len(table)} rows, expected {count}")
        ids = [r[key] for r in table]
        check(len(ids) == len(set(ids)) and all(ids), f"{name}: blank or duplicate {key}")
        tables[name] = table

    accounts = {r["account_id"]: r for r in tables["crm_accounts"]}
    contacts = {r["contact_id"]: r for r in tables["crm_contacts"]}
    owners = {r["owner_id"]: r for r in tables["crm_owners"]}
    opps = {r["opp_id"]: r for r in tables["crm_opportunities"]}
    inquiries = {r["inquiry_id"]: r for r in tables["mkt_inquiries"]}
    customers = {r["billing_customer_id"]: r for r in tables["fin_customers"]}
    subs = {r["subscription_id"]: r for r in tables["fin_subscriptions"]}
    campaigns = {r["campaign_id"]: r for r in tables["mkt_campaigns"]}

    for contact in contacts.values():
        check(contact["account_id"] in accounts, f"Orphan contact: {contact['contact_id']}")
        check(contact["email"].endswith("@example.com"), f"Unsafe email: {contact['contact_id']}")
        check(moment(contact["created_at"]) >= moment(accounts[contact["account_id"]]["created_at"]), f"Contact before account: {contact['contact_id']}")
    for inquiry in inquiries.values():
        check(inquiry["account_id"] in accounts and inquiry["contact_id"] in contacts, f"Orphan inquiry: {inquiry['inquiry_id']}")
        check(contacts[inquiry["contact_id"]]["account_id"] == inquiry["account_id"], f"Inquiry account/contact mismatch: {inquiry['inquiry_id']}")
        check(inquiry["campaign_id"] in campaigns, f"Unknown campaign: {inquiry['inquiry_id']}")
        submitted = moment(inquiry["submitted_at"])
        check(submitted >= moment(contacts[inquiry["contact_id"]]["created_at"]), f"Inquiry before contact: {inquiry['inquiry_id']}")
        check(submitted.date().isoformat() >= campaigns[inquiry["campaign_id"]]["starts_at"], f"Inquiry before campaign: {inquiry['inquiry_id']}")
        if inquiry["first_mql_at"]:
            check(moment(inquiry["first_mql_at"]) >= submitted, f"MQL before inquiry: {inquiry['inquiry_id']}")
        if inquiry["first_sql_at"]:
            check(inquiry["first_mql_at"] and moment(inquiry["first_sql_at"]) >= moment(inquiry["first_mql_at"]), f"SQL before MQL: {inquiry['inquiry_id']}")
    for opp in opps.values():
        check(opp["account_id"] in accounts and opp["owner_id"] in owners, f"Orphan opportunity: {opp['opp_id']}")
        check(moment(opp["created_at"]) >= moment(accounts[opp["account_id"]]["created_at"]), f"Opportunity before account: {opp['opp_id']}")
        check(opp["stage_current"] in VALID_STAGES or opp["opp_id"] == "OPP-DQ-001", f"Unknown stage: {opp['opp_id']}")
    check(opps["OPP-DQ-001"]["stage_current"] == "LEGACY_HANDOFF", "Missing unknown-stage fixture")
    check(accounts["ACCT-DQ-001"]["domain"] == accounts["ACCT-DQ-002"]["domain"], "Missing duplicate-domain fixture")

    events_by_opp: dict[str, list[dict[str, str]]] = defaultdict(list)
    for event in tables["crm_opportunity_stage_events"]:
        check(event["opp_id"] in opps, f"Orphan stage event: {event['stage_event_id']}")
        check(moment(event["recorded_at"]) >= moment(event["occurred_at"]), f"Recorded before occurrence: {event['stage_event_id']}")
        events_by_opp[event["opp_id"]].append(event)
    for opp_id, opp in opps.items():
        history = sorted(events_by_opp[opp_id], key=lambda e: e["occurred_at"])
        check(bool(history), f"No stage history: {opp_id}")
        check(history[0]["to_stage"] == "DISCOVERY", f"Bad initial stage: {opp_id}")
        check(history[-1]["to_stage"] == opp["stage_current"], f"Current-stage mismatch: {opp_id}")
        for prior, current in zip(history, history[1:]):
            check(current["from_stage"] == prior["to_stage"], f"Broken stage chain: {opp_id}")
        if opp["stage_current"] in {"CLOSED_WON", "CLOSED_LOST"}:
            check(opp["closed_at_current"] == history[-1]["occurred_at"], f"Wrong closed_at: {opp_id}")
    late = [e for e in events_by_opp["OPP-DQ-002"] if e["occurred_at"].startswith("2026-05-28")]
    check(len(late) == 1 and late[0]["recorded_at"].startswith("2026-06-02"), "Missing late-arrival fixture")

    primary_counts = Counter()
    orphan_links = []
    for link in tables["crm_opportunity_source_links"]:
        check(link["opp_id"] in opps, f"Orphan link opportunity: {link['source_link_id']}")
        if link["inquiry_id"] not in inquiries:
            orphan_links.append(link["source_link_id"])
            continue
        if link["link_role"] == "PRIMARY_SOURCED":
            primary_counts[link["opp_id"]] += 1
            check(opps[link["opp_id"]]["account_id"] == inquiries[link["inquiry_id"]]["account_id"], f"Cross-account primary source: {link['source_link_id']}")
            check(moment(link["linked_at"]) >= moment(opps[link["opp_id"]]["created_at"]), f"Link before opportunity: {link['source_link_id']}")
    check(orphan_links == ["SRC-DQ-001"], f"Unexpected orphan links: {orphan_links}")
    check(all(n == 1 for n in primary_counts.values()), "Multiple primary sources on an opportunity")

    links = tables["identity_account_links"]
    check(all(r["external_system"] == "BILLING" and r["crm_account_id"] in accounts and r["external_entity_id"] in customers for r in links), "Invalid billing identity map")
    billing_account = {r["external_entity_id"]: r["crm_account_id"] for r in links}
    check(len(billing_account) == 90, "Billing customer mapping is not one-to-one in core")
    for sub in subs.values():
        check(sub["billing_customer_id"] in customers, f"Orphan subscription: {sub['subscription_id']}")
        if sub["originating_opp_id"]:
            opp = opps[sub["originating_opp_id"]]
            check(opp["stage_current"] == "CLOSED_WON", f"Subscription from non-won opportunity: {sub['subscription_id']}")
            check(opp["account_id"] == billing_account[sub["billing_customer_id"]], f"Subscription account mismatch: {sub['subscription_id']}")
            check(opp["closed_at_current"][:10] < sub["starts_on"], f"Subscription before win: {sub['subscription_id']}")
    revenue_months: dict[str, list[str]] = defaultdict(list)
    for line in tables["fin_monthly_service_revenue"]:
        check(line["subscription_id"] in subs, f"Orphan revenue line: {line['revenue_line_id']}")
        check(line["service_month"] >= subs[line["subscription_id"]]["starts_on"], f"Revenue before subscription: {line['revenue_line_id']}")
        check(moment(line["posted_at"]) <= JUN_END, f"Future posted revenue: {line['revenue_line_id']}")
        check(Decimal(line["amount_usd"]) >= 0, f"Negative management revenue not expected in core: {line['revenue_line_id']}")
        revenue_months[line["subscription_id"]].append(line["service_month"])
    for sub_id, sub in subs.items():
        start = date.fromisoformat(sub["starts_on"])
        expected_months = []
        cursor = start
        while cursor <= date(2026, 6, 1):
            expected_months.append(cursor.isoformat())
            cursor = date(cursor.year + (cursor.month == 12), cursor.month % 12 + 1, 1)
        check(sorted(revenue_months[sub_id]) == expected_months, f"Missing or duplicate monthly service revenue: {sub_id}")

    def stage_as_of(opp_id: str, instant: datetime) -> str:
        eligible = [e for e in events_by_opp[opp_id] if moment(e["occurred_at"]) <= instant]
        return max(eligible, key=lambda e: e["occurred_at"])["to_stage"] if eligible else ""

    def control_account(account_id: str) -> bool:
        account = accounts[account_id]
        return account["region"] == "US_EAST" and account["segment"] == "MID_MARKET"

    mql = [i for i in inquiries.values() if i["first_mql_at"].startswith("2026-04") and i["is_test"] == "false" and control_account(i["account_id"])]
    check(len(mql) == 24, f"April MQL inquiries: {len(mql)}")
    check(len({i["contact_id"] for i in mql}) == 20, "April unique MQL contacts")
    sql_ids = {i["inquiry_id"] for i in mql if i["first_sql_at"] and moment(i["first_sql_at"]) <= JUN_END}
    check(len(sql_ids) == 6, f"April cohort SQL: {len(sql_ids)}")
    sourced = {l["opp_id"] for l in tables["crm_opportunity_source_links"] if l["link_role"] == "PRIMARY_SOURCED" and l["inquiry_id"] in {i["inquiry_id"] for i in mql}}
    check(len(sourced) == 3, f"April cohort opportunities: {len(sourced)}")
    won = {opp_id for opp_id in sourced if stage_as_of(opp_id, JUN_END) == "CLOSED_WON"}
    check(len(won) == 1, f"April cohort won: {len(won)}")

    april_pipeline = [o for o in opps.values() if control_account(o["account_id"]) and stage_as_of(o["opp_id"], APR_END) in OPEN_STAGES]
    sales_pipeline = sum((Decimal(o["amount_usd"]) for o in april_pipeline), Decimal(0))
    check(len(april_pipeline) == 11 and sales_pipeline == Decimal("1200000"), f"April Sales pipeline: {len(april_pipeline)} rows, {sales_pipeline}")
    distinct_quotes = {}
    for opp in sorted(april_pipeline, key=lambda o: (o["created_at"], o["opp_id"])):
        distinct_quotes.setdefault(opp["external_quote_id"], opp)
    valid_all = sum((Decimal(o["amount_usd"]) for o in distinct_quotes.values()), Decimal(0))
    new_business = sum((Decimal(o["amount_usd"]) for o in distinct_quotes.values() if o["opportunity_type"] == "NEW_BUSINESS"), Decimal(0))
    check(valid_all == Decimal("1120000") and new_business == Decimal("940000"), f"Pipeline definitions: {valid_all}, {new_business}")
    bookings = sum((Decimal(opps[opp_id]["amount_usd"]) for opp_id, events in events_by_opp.items() for e in events if e["to_stage"] == "CLOSED_WON" and e["occurred_at"].startswith("2026-04") and control_account(opps[opp_id]["account_id"]) and opps[opp_id]["opportunity_type"] == "NEW_BUSINESS"), Decimal(0))
    check(bookings == Decimal("360000"), f"April bookings: {bookings}")
    april_service_revenue = sum((Decimal(line["amount_usd"]) for line in tables["fin_monthly_service_revenue"] if line["service_month"] == "2026-04-01" and control_account(billing_account[subs[line["subscription_id"]]["billing_customer_id"]])), Decimal(0))
    check(april_service_revenue == Decimal("70000"), f"April service revenue: {april_service_revenue}")

    june_open = [o for o in opps.values() if o["stage_current"] in OPEN_STAGES]
    check(len(june_open) == 20, f"June valid open opportunities: {len(june_open)}")
    stale = {o["opp_id"] for o in june_open if JUN_END - max(moment(e["occurred_at"]) for e in events_by_opp[o["opp_id"]]) > timedelta(days=45)}
    slips = Counter()
    for event in tables["crm_opportunity_field_events"]:
        if event["field_name"] == "expected_close_date" and moment(event["occurred_at"]) >= JUN_END - timedelta(days=90) and event["new_value"] > event["old_value"]:
            slips[event["opp_id"]] += 1
    slipped = {o["opp_id"] for o in june_open if slips[o["opp_id"]] >= 2}
    check(stale == {f"PH{i:03d}" for i in range(1, 7)}, f"Stale open deals: {sorted(stale)}")
    check(slipped == {f"PH{i:03d}" for i in range(5, 9)}, f"Slipped open deals: {sorted(slipped)}")
    check(len(stale | slipped) == 8, "Pipeline risk union")

    report_specs = {
        "marketing_april_mql_inquiries.csv": (24, None),
        "sales_april_mql_contacts.csv": (20, None),
        "sales_april_open_pipeline.csv": (11, Decimal("1200000")),
        "finance_april_new_business_pipeline.csv": (8, Decimal("940000")),
        "sales_april_bookings_labeled_revenue.csv": (3, Decimal("360000")),
        "finance_april_service_revenue.csv": (4, Decimal("70000")),
    }
    for filename, (count, total) in report_specs.items():
        report = rows(data / "reports/baseline" / filename)
        check(len(report) == count, f"Report {filename}: {len(report)} rows, expected {count}")
        if total is not None:
            check(sum((Decimal(r["amount_usd"]) for r in report), Decimal(0)) == total, f"Report total: {filename}")

    manifest = json.loads((data / "manifest.json").read_text(encoding="utf-8"))
    for relative, expected_hash in manifest["sha256_csv"].items():
        actual_hash = hashlib.sha256((data / relative).read_bytes()).hexdigest()
        check(actual_hash == expected_hash, f"Checksum mismatch: {relative}")
    for table, records in tables.items():
        check(manifest["row_counts"][table] == len(records), f"Manifest row count: {table}")
    return {"tables": len(tables), "source_rows": sum(len(t) for t in tables.values()), "april_mql_inquiries": len(mql), "april_unique_mql_contacts": len({i["contact_id"] for i in mql}), "april_sales_pipeline_usd": str(sales_pipeline), "april_new_business_pipeline_usd": str(new_business), "april_bookings_usd": str(bookings), "april_service_revenue_usd": str(april_service_revenue), "june_open_deals": len(june_open), "june_at_risk_deals": len(stale | slipped)}


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate Fiction Cloud Inc. core CSV fixtures")
    parser.add_argument("--data", type=Path, required=True, help="Directory created by generate.py")
    args = parser.parse_args()
    result = validate(args.data.resolve())
    print(json.dumps(result, indent=2))
    print("PASS: core source records, baseline reports, and expected case metrics reconcile")


if __name__ == "__main__":
    main()
