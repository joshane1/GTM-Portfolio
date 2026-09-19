"""Generate Fiction Cloud Inc. core source-system CSV fixtures.

This is a source-data generator, not a solution to the portfolio assignments.
It never connects to a CRM, sends messages, or writes outside --output.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import random
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from importlib.metadata import version
from pathlib import Path
from zoneinfo import ZoneInfo

from faker import Faker


SEED = 20260918
SCHEMA_VERSION = "1.0.0"
GENERATOR_VERSION = "1.0.0"
UTC = timezone.utc
AS_OF = datetime(2026, 6, 30, 23, 59, 59, tzinfo=UTC)
CONTROL_ACCOUNTS = [f"ACC-CTRL-{i:03d}" for i in range(1, 41)]
FILLER_ACCOUNTS = [f"ACC-{i:03d}" for i in range(1, 199)]
STAGES_OPEN = {"DISCOVERY", "EVALUATION", "PROPOSAL", "NEGOTIATION"}
REGION_ZONES = {"US_EAST": "America/New_York", "US_WEST": "America/Los_Angeles", "UK": "Europe/London"}

TABLES: dict[str, tuple[str, list[str], int]] = {
    "crm_accounts": ("raw/crm", ["account_id", "name", "domain", "segment", "region", "industry", "created_at", "lifecycle_stage_current", "source_updated_at", "ingested_at"], 240),
    "crm_contacts": ("raw/crm", ["contact_id", "account_id", "email", "persona", "created_at", "lifecycle_stage_current", "source_updated_at", "ingested_at"], 720),
    "crm_owners": ("raw/crm", ["owner_id", "team", "region", "segment", "active_from", "active_to", "is_available", "source_updated_at", "ingested_at"], 16),
    "crm_opportunities": ("raw/crm", ["opp_id", "account_id", "owner_id", "opportunity_type", "stage_current", "amount_usd", "created_at", "expected_close_date_current", "closed_at_current", "external_quote_id", "source_updated_at", "ingested_at"], 240),
    "crm_opportunity_source_links": ("raw/crm", ["source_link_id", "opp_id", "inquiry_id", "link_role", "linked_at", "ingested_at"], 180),
    "crm_opportunity_stage_events": ("raw/crm", ["stage_event_id", "opp_id", "from_stage", "to_stage", "occurred_at", "recorded_at", "ingested_at"], 900),
    "crm_opportunity_field_events": ("raw/crm", ["field_event_id", "opp_id", "field_name", "old_value", "new_value", "occurred_at", "recorded_at", "ingested_at"], 450),
    "mkt_inquiries": ("raw/marketing", ["inquiry_id", "contact_id", "account_id", "channel", "campaign_id", "submitted_at", "first_mql_at", "first_sql_at", "qualification_status", "is_test", "source_updated_at", "ingested_at"], 960),
    "mkt_touches": ("raw/marketing", ["touch_id", "inquiry_id", "contact_id", "campaign_id", "channel", "occurred_at", "ingested_at"], 3000),
    "mkt_campaigns": ("raw/marketing", ["campaign_id", "name", "channel", "starts_at", "ends_at", "source_updated_at", "ingested_at"], 24),
    "fin_customers": ("raw/finance", ["billing_customer_id", "created_at", "status", "source_updated_at", "ingested_at"], 90),
    "fin_subscriptions": ("raw/finance", ["subscription_id", "billing_customer_id", "originating_opp_id", "starts_on", "ends_on", "status", "annual_contract_value_usd", "licensed_seats", "source_updated_at", "ingested_at"], 100),
    "fin_monthly_service_revenue": ("raw/finance", ["revenue_line_id", "subscription_id", "service_month", "amount_usd", "posted_at", "ingested_at"], 850),
    "identity_account_links": ("raw/identity", ["link_id", "crm_account_id", "external_system", "external_entity_id", "valid_from", "valid_to", "match_status", "source_updated_at", "ingested_at"], 90),
}


def stamp(value: datetime) -> str:
    return value.astimezone(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


def dt(y: int, m: int, d: int, h: int = 12, minute: int = 0, second: int = 0) -> datetime:
    return datetime(y, m, d, h, minute, second, tzinfo=UTC)


def money(value: int | Decimal) -> str:
    return f"{Decimal(value):.2f}"


def add_month(value: date) -> date:
    return date(value.year + (value.month == 12), value.month % 12 + 1, 1)


class CaseBuilder:
    def __init__(self, seed: int):
        self.seed = seed
        self.rng = random.Random(seed)
        self.fake = Faker("en_US")
        self.fake.seed_instance(seed)
        self.rows: dict[str, list[dict[str, str]]] = {name: [] for name in TABLES}
        self.accounts: dict[str, dict[str, str]] = {}
        self.contacts_by_account: dict[str, list[str]] = defaultdict(list)
        self.opps: dict[str, dict[str, str]] = {}
        self.inquiries: dict[str, dict[str, str]] = {}
        self.subscriptions: dict[str, dict[str, str]] = {}
        self.billing_to_account: dict[str, str] = {}

    def add(self, table: str, row: dict[str, str]) -> None:
        fields = TABLES[table][1]
        extra = set(row) - set(fields)
        if extra:
            raise ValueError(f"Unexpected {table} columns: {sorted(extra)}")
        self.rows[table].append({field: row.get(field, "") for field in fields})

    def owners(self) -> None:
        fixed = [
            ("AE-E1", "SALES", "US_EAST", "MID_MARKET"),
            ("AE-E2", "SALES", "US_EAST", "MID_MARKET"),
            ("AE-W1", "SALES", "US_WEST", "MID_MARKET"),
            ("AE-UK1", "SALES", "UK", "MID_MARKET"),
            ("AE-ENT1", "SALES", "US_EAST", "ENTERPRISE"),
            ("CS-1", "CUSTOMER_SUCCESS", "", ""),
        ]
        others = [(f"OWN-{i:02d}", "SALES" if i < 8 else "TRIAGE", self.rng.choice(list(REGION_ZONES)), self.rng.choice(["MID_MARKET", "ENTERPRISE"])) for i in range(1, 11)]
        for owner_id, team, region, segment in fixed + others:
            self.add("crm_owners", {"owner_id": owner_id, "team": team, "region": region, "segment": segment, "active_from": "2025-01-01", "is_available": "true", "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)})

    def accounts_and_contacts(self) -> None:
        for n, account_id in enumerate(CONTROL_ACCOUNTS, 1):
            created = dt(2025, 1, 5) + timedelta(days=n)
            row = {"account_id": account_id, "name": f"Fiction Client {n:03d}", "domain": f"client{n:03d}.example.com", "segment": "MID_MARKET", "region": "US_EAST", "industry": ["Software", "Logistics", "Business Services"][n % 3], "created_at": stamp(created), "lifecycle_stage_current": "CUSTOMER" if n in (30, 31, 32, 33) else "LEAD", "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)}
            self.accounts[account_id] = row
            self.add("crm_accounts", row)
        for n, account_id in enumerate(FILLER_ACCOUNTS, 1):
            region, segment = self.rng.choice([("US_EAST", "ENTERPRISE"), ("US_WEST", "MID_MARKET"), ("US_WEST", "ENTERPRISE"), ("UK", "MID_MARKET"), ("UK", "ENTERPRISE")])
            created = dt(2025, 1, 1) + timedelta(days=self.rng.randrange(220))
            row = {"account_id": account_id, "name": f"Fiction {self.fake.company()}", "domain": f"fc{n:04d}.example.com", "segment": segment, "region": region, "industry": self.rng.choice(["Software", "Logistics", "Healthcare Operations", "Business Services", "Manufacturing"]), "created_at": stamp(created), "lifecycle_stage_current": "LEAD", "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)}
            self.accounts[account_id] = row
            self.add("crm_accounts", row)
        for n in (1, 2):
            account_id = f"ACCT-DQ-{n:03d}"
            row = {"account_id": account_id, "name": f"Fiction Duplicate Domain {n}", "domain": "shared-dq.example.com", "segment": "ENTERPRISE", "region": "UK", "industry": "Software", "created_at": stamp(dt(2025, 2, n)), "lifecycle_stage_current": "LEAD", "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)}
            self.accounts[account_id] = row
            self.add("crm_accounts", row)

        def make_contact(contact_id: str, account_id: str) -> None:
            first, last = self.fake.first_name(), self.fake.last_name()
            email = f"{first.lower().replace(' ', '')}.{last.lower().replace(' ', '')}.{contact_id.lower()}@example.com"
            account_created = datetime.fromisoformat(self.accounts[account_id]["created_at"].replace("Z", "+00:00"))
            row = {"contact_id": contact_id, "account_id": account_id, "email": email, "persona": self.rng.choice(["OPERATIONS", "IT", "FINANCE", "EXECUTIVE"]), "created_at": stamp(account_created + timedelta(days=7)), "lifecycle_stage_current": "LEAD", "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)}
            self.add("crm_contacts", row)
            self.contacts_by_account[account_id].append(contact_id)

        for n in range(1, 21):
            make_contact(f"CT-APR-{n:03d}", f"ACC-CTRL-{n:03d}")
        remaining_accounts = [a for a in self.accounts if not self.contacts_by_account[a]]
        assigned = remaining_accounts + [self.rng.choice(list(self.accounts)) for _ in range(700 - len(remaining_accounts))]
        for n, account_id in enumerate(assigned, 1):
            make_contact(f"CT-{n:04d}", account_id)

    def campaigns(self) -> None:
        for n in range(1, 25):
            start = date(2025, 1, 1) + timedelta(days=(n - 1) * 18)
            self.add("mkt_campaigns", {"campaign_id": f"CAMP-{n:03d}", "name": f"Fiction Campaign {n:02d}", "channel": ["EMAIL", "PAID_SEARCH", "WEBINAR", "PARTNER"][n % 4], "starts_at": start.isoformat(), "ends_at": "2026-06-30", "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)})

    def opportunity(self, opp_id: str, account_id: str, opp_type: str, amount: int, owner: str, created: datetime, stages: list[tuple[str, datetime]], quote: str, expected_close: date) -> None:
        final_stage, final_time = stages[-1]
        row = {"opp_id": opp_id, "account_id": account_id, "owner_id": owner, "opportunity_type": opp_type, "stage_current": final_stage, "amount_usd": money(amount), "created_at": stamp(created), "expected_close_date_current": expected_close.isoformat(), "closed_at_current": stamp(final_time) if final_stage in {"CLOSED_WON", "CLOSED_LOST"} else "", "external_quote_id": quote, "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)}
        self.opps[opp_id] = row
        self.add("crm_opportunities", row)
        previous = ""
        for stage, occurred in stages:
            recorded = dt(2026, 6, 2) if opp_id == "OPP-DQ-002" and occurred == dt(2026, 5, 28) else occurred + timedelta(minutes=15)
            self.add("crm_opportunity_stage_events", {"stage_event_id": f"STG-{len(self.rows['crm_opportunity_stage_events']) + 1:05d}", "opp_id": opp_id, "from_stage": previous, "to_stage": stage, "occurred_at": stamp(occurred), "recorded_at": stamp(recorded), "ingested_at": stamp(recorded)})
            previous = stage

    def opportunities(self) -> None:
        amounts = [80000, 100000, 110000, 120000, 130000, 140000, 150000, 110000, 80000, 100000, 80000]
        for n, amount in enumerate(amounts, 1):
            opp_id = f"OPP-APR-{n:03d}"
            account_id = "ACC-CTRL-001" if n == 11 else f"ACC-CTRL-{n:03d}"
            created = dt(2026, 3, 1) + timedelta(days=n)
            close = dt(2026, 5, 20) + timedelta(days=n % 5)
            stages = [("DISCOVERY", created), ("EVALUATION", dt(2026, 3, 25)), ("PROPOSAL", dt(2026, 4, 15)), ("CLOSED_LOST", close)]
            self.opportunity(opp_id, account_id, "NEW_BUSINESS" if n <= 8 or n == 11 else "RENEWAL", amount, "AE-E2" if n == 1 else "AE-E1", created, stages, "Q-APR-001" if n == 11 else f"Q-APR-{n:03d}", date(2026, 6, 15))
        for n, amount in enumerate((100000, 120000, 140000), 1):
            created = dt(2026, 2, n + 1)
            close = dt(2026, 4, (10, 20, 25)[n - 1])
            self.opportunity(f"OPP-WON-APR-{n:03d}", f"ACC-CTRL-{n + 20:03d}", "NEW_BUSINESS", amount, "AE-E1", created, [("DISCOVERY", created), ("EVALUATION", dt(2026, 3, 1)), ("PROPOSAL", dt(2026, 4, 1)), ("CLOSED_WON", close)], f"Q-WON-APR-{n:03d}", date(2026, 4, 30))
        for n, final_stage in ((1, "CLOSED_WON"), (2, "CLOSED_LOST")):
            created = dt(2026, 5, n + 3)
            close = dt(2026, 6, 10 + n * 4)
            self.opportunity(f"OPP-COHORT-{n:03d}", f"ACC-CTRL-{n:03d}", "NEW_BUSINESS", 120000 if n == 1 else 90000, "AE-E1", created, [("DISCOVERY", created), ("EVALUATION", dt(2026, 5, 15)), ("PROPOSAL", dt(2026, 6, 1)), (final_stage, close)], f"Q-COHORT-{n:03d}", date(2026, 6, 30))
        for n in range(1, 21):
            account_id = "ACC-CTRL-003" if n == 20 else f"ACC-{n:03d}"
            created = dt(2026, 4, 1) if n <= 8 else dt(2026, 5, 20)
            last = dt(2026, 5, 1) if n <= 6 else dt(2026, 6, 20)
            self.opportunity(f"PH{n:03d}", account_id, "NEW_BUSINESS", 45000 + n * 1500, "AE-E1", created, [("DISCOVERY", created), ("PROPOSAL", last)], f"Q-PH-{n:03d}", date(2026, 10, 1) if 5 <= n <= 8 else date(2026, 8, 1))
        self.opportunity("OPP-DQ-001", "ACCT-DQ-001", "NEW_BUSINESS", 55000, "AE-UK1", dt(2026, 4, 1), [("DISCOVERY", dt(2026, 4, 1)), ("LEGACY_HANDOFF", dt(2026, 5, 1))], "Q-DQ-001", date(2026, 7, 1))
        self.opportunity("OPP-DQ-002", "ACCT-DQ-002", "NEW_BUSINESS", 62000, "AE-UK1", dt(2026, 4, 1), [("DISCOVERY", dt(2026, 4, 1)), ("CLOSED_LOST", dt(2026, 5, 28))], "Q-DQ-002", date(2026, 5, 28))
        for n in range(1, 203):
            account_id = FILLER_ACCOUNTS[(n - 1) % len(FILLER_ACCOUNTS)]
            account_created = datetime.fromisoformat(self.accounts[account_id]["created_at"].replace("Z", "+00:00"))
            created = max(account_created + timedelta(days=30), dt(2025, 1, 15) + timedelta(days=self.rng.randrange(390)))
            closed = created + timedelta(days=self.rng.randrange(45, 106))
            final_stage = "CLOSED_WON" if n % 3 == 0 else "CLOSED_LOST"
            if n <= 16:
                stages = [("DISCOVERY", created), ("PROPOSAL", created + (closed - created) // 2), (final_stage, closed)]
            else:
                stages = [("DISCOVERY", created), ("EVALUATION", created + (closed - created) // 3), ("PROPOSAL", created + (closed - created) * 2 // 3), (final_stage, closed)]
            self.opportunity(f"OPP-{n:04d}", account_id, "NEW_BUSINESS" if n % 5 else "EXPANSION", 20000 + 1000 * (n % 95), self.rng.choice(["AE-W1", "AE-UK1", "AE-ENT1"]), created, stages, f"Q-FILL-{n:04d}", closed.date())

    def field_events(self) -> None:
        def event(opp_id: str, field: str, before: str, after: str, occurred: datetime) -> None:
            self.add("crm_opportunity_field_events", {"field_event_id": f"FLD-{len(self.rows['crm_opportunity_field_events']) + 1:05d}", "opp_id": opp_id, "field_name": field, "old_value": before, "new_value": after, "occurred_at": stamp(occurred), "recorded_at": stamp(occurred + timedelta(minutes=15)), "ingested_at": stamp(occurred + timedelta(minutes=15))})

        for n in range(5, 9):
            opp_id = f"PH{n:03d}"
            event(opp_id, "expected_close_date", "2026-08-01", "2026-09-01", dt(2026, 4, 15))
            event(opp_id, "expected_close_date", "2026-09-01", "2026-10-01", dt(2026, 5, 20))
        for opp_id, row in self.opps.items():
            if opp_id.startswith("PH"):
                continue
            created = datetime.fromisoformat(row["created_at"].replace("Z", "+00:00"))
            amount = Decimal(row["amount_usd"])
            event(opp_id, "amount_usd", money(amount - Decimal(1000)), row["amount_usd"], created + timedelta(hours=1))
            event(opp_id, "owner_id", "OWN-01", row["owner_id"], created + timedelta(hours=2))
        for n in (1, 2):
            event(f"PH{n:03d}", "owner_id", "OWN-01", "AE-E1", dt(2026, 5, 2))

    def add_inquiry(self, inquiry_id: str, account_id: str, contact_id: str, submitted: datetime, mql: datetime | None, sql: datetime | None, channel: str = "FORM") -> None:
        eligible_campaigns = min(24, max(1, ((submitted.date() - date(2025, 1, 1)).days // 18) + 1))
        campaign_id = "CAMP-001" if inquiry_id.startswith("INQ-APR") else f"CAMP-{self.rng.randrange(1, eligible_campaigns + 1):03d}"
        row = {"inquiry_id": inquiry_id, "contact_id": contact_id, "account_id": account_id, "channel": channel, "campaign_id": campaign_id, "submitted_at": stamp(submitted), "first_mql_at": stamp(mql) if mql else "", "first_sql_at": stamp(sql) if sql else "", "qualification_status": "SQL" if sql else "MQL" if mql else "NEW", "is_test": "false", "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)}
        self.inquiries[inquiry_id] = row
        self.add("mkt_inquiries", row)

    def inquiries_and_touches(self) -> None:
        for n in range(1, 25):
            contact_number = n if n <= 20 else 16 + (n - 20)
            account_id = f"ACC-CTRL-{contact_number:03d}"
            submitted = dt(2026, 4, 2) + timedelta(days=n - 1)
            mql = submitted + timedelta(hours=2)
            sql = dt(2026, 4, 27) + timedelta(days=n - 1) if n <= 6 else None
            self.add_inquiry(f"INQ-APR-{n:03d}", account_id, f"CT-APR-{contact_number:03d}", submitted, mql, sql)
        routing_accounts = CONTROL_ACCOUNTS[23:27] + [a for a in FILLER_ACCOUNTS if self.accounts[a]["region"] == "US_WEST" and self.accounts[a]["segment"] == "MID_MARKET"][:2] + [a for a in FILLER_ACCOUNTS if self.accounts[a]["region"] == "UK" and self.accounts[a]["segment"] == "MID_MARKET"][:2] + [a for a in FILLER_ACCOUNTS if self.accounts[a]["region"] == "US_EAST" and self.accounts[a]["segment"] == "ENTERPRISE"][:2] + ["ACC-CTRL-001", "ACC-CTRL-030"]
        assert len(routing_accounts) == 12
        for n, account_id in enumerate(routing_accounts, 1):
            region = self.accounts[account_id]["region"]
            local = datetime(2026, 5, 8, 16, 30, tzinfo=ZoneInfo(REGION_ZONES[region])) if n == 12 else datetime(2026, 5, 4, 10, 0, n - 1, tzinfo=ZoneInfo(REGION_ZONES[region]))
            submitted = local.astimezone(UTC)
            self.add_inquiry(f"R{n:03d}", account_id, self.contacts_by_account[account_id][0], submitted, submitted + timedelta(hours=1), None)
        for n in range(1, 203):
            opp = self.opps[f"OPP-{n:04d}"]
            account_id = opp["account_id"]
            created = datetime.fromisoformat(opp["created_at"].replace("Z", "+00:00"))
            submitted = created - timedelta(days=12)
            self.add_inquiry(f"INQ-FILL-{n:04d}", account_id, self.contacts_by_account[account_id][0], submitted, submitted + timedelta(days=1), submitted + timedelta(days=3), "WEBINAR")
        remaining = 960 - len(self.rows["mkt_inquiries"])
        for n in range(1, remaining + 1):
            account_id = self.rng.choice(FILLER_ACCOUNTS)
            contact_id = self.rng.choice(self.contacts_by_account[account_id])
            contact_created = next(r["created_at"] for r in self.rows["crm_contacts"] if r["contact_id"] == contact_id)
            submitted = max(dt(2025, 1, 15) + timedelta(days=self.rng.randrange(520), hours=self.rng.randrange(8)), datetime.fromisoformat(contact_created.replace("Z", "+00:00")) + timedelta(days=1))
            mql = submitted + timedelta(days=1) if self.rng.random() < 0.6 else None
            sql = mql + timedelta(days=2) if mql and self.rng.random() < 0.45 else None
            self.add_inquiry(f"INQ-{n:04d}", account_id, contact_id, submitted, mql, sql, self.rng.choice(["FORM", "TRIAL", "PARTNER", "WEBINAR"]))
        inquiry_list = self.rows["mkt_inquiries"]
        for n in range(1, 3001):
            inquiry = inquiry_list[(n * 37) % len(inquiry_list)]
            submitted = datetime.fromisoformat(inquiry["submitted_at"].replace("Z", "+00:00"))
            campaign = next(c for c in self.rows["mkt_campaigns"] if c["campaign_id"] == inquiry["campaign_id"])
            campaign_start = datetime.fromisoformat(campaign["starts_at"] + "T00:00:00+00:00")
            occurred = max(dt(2025, 1, 1), campaign_start, submitted - timedelta(days=n % 20))
            self.add("mkt_touches", {"touch_id": f"TOUCH-{n:05d}", "inquiry_id": inquiry["inquiry_id"] if n % 6 else "", "contact_id": inquiry["contact_id"], "campaign_id": inquiry["campaign_id"], "channel": ["EMAIL", "PAID_SEARCH", "WEBINAR", "PARTNER"][n % 4], "occurred_at": stamp(occurred), "ingested_at": stamp(occurred + timedelta(hours=1))})

    def source_links(self) -> None:
        for n, opp_id in enumerate(("OPP-COHORT-001", "OPP-COHORT-002", "PH020"), 1):
            inquiry = self.inquiries[f"INQ-APR-{n:03d}"]
            linked = datetime.fromisoformat(self.opps[opp_id]["created_at"].replace("Z", "+00:00")) + timedelta(hours=1)
            self.add("crm_opportunity_source_links", {"source_link_id": f"SRC-{n:04d}", "opp_id": opp_id, "inquiry_id": inquiry["inquiry_id"], "link_role": "PRIMARY_SOURCED", "linked_at": stamp(linked), "ingested_at": stamp(linked + timedelta(minutes=15))})
        for n in range(1, 177):
            opp_id = f"OPP-{n:04d}"
            inquiry_id = f"INQ-FILL-{n:04d}"
            linked = datetime.fromisoformat(self.opps[opp_id]["created_at"].replace("Z", "+00:00")) + timedelta(days=1)
            self.add("crm_opportunity_source_links", {"source_link_id": f"SRC-{n + 3:04d}", "opp_id": opp_id, "inquiry_id": inquiry_id, "link_role": "PRIMARY_SOURCED", "linked_at": stamp(linked), "ingested_at": stamp(linked + timedelta(minutes=15))})
        self.add("crm_opportunity_source_links", {"source_link_id": "SRC-DQ-001", "opp_id": "OPP-DQ-002", "inquiry_id": "INQ-NOT-FOUND", "link_role": "INFLUENCED", "linked_at": stamp(dt(2026, 5, 1)), "ingested_at": stamp(dt(2026, 5, 1, 13))})

    def finance(self) -> None:
        control_accounts = [f"ACC-CTRL-{n:03d}" for n in (30, 31, 32, 33, 21, 22, 23)]
        billing_accounts = control_accounts + FILLER_ACCOUNTS[:83]
        for n, account_id in enumerate(billing_accounts, 1):
            customer_id = f"BILL-{n:03d}"
            self.billing_to_account[customer_id] = account_id
            self.add("fin_customers", {"billing_customer_id": customer_id, "created_at": stamp(dt(2025, 1, 1)), "status": "ACTIVE", "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)})
            self.add("identity_account_links", {"link_id": f"MAP-BILL-{n:03d}", "crm_account_id": account_id, "external_system": "BILLING", "external_entity_id": customer_id, "valid_from": stamp(dt(2025, 1, 1)), "valid_to": "", "match_status": "VERIFIED", "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)})

        def sub(sub_id: str, customer_id: str, opp_id: str, starts: date, annual: int, seats: int) -> None:
            row = {"subscription_id": sub_id, "billing_customer_id": customer_id, "originating_opp_id": opp_id, "starts_on": starts.isoformat(), "ends_on": "", "status": "ACTIVE", "annual_contract_value_usd": money(annual), "licensed_seats": str(seats), "source_updated_at": stamp(dt(2026, 6, 30)), "ingested_at": stamp(AS_OF)}
            self.subscriptions[sub_id] = row
            self.add("fin_subscriptions", row)

        for n, monthly in enumerate((10000, 15000, 20000, 25000), 1):
            sub(f"SUB-CTRL-{n:03d}", f"BILL-{n:03d}", "", date(2026, 1, 1), monthly * 12, 40 + n * 5)
        for n, annual in enumerate((100000, 120000, 140000), 1):
            sub(f"SUB-WON-APR-{n:03d}", f"BILL-{n + 4:03d}", f"OPP-WON-APR-{n:03d}", date(2026, 5, 1), annual, 25 + n * 5)
        won_by_account: dict[str, str] = {}
        for opp in self.rows["crm_opportunities"]:
            if opp["stage_current"] == "CLOSED_WON" and opp["account_id"] in FILLER_ACCOUNTS:
                won_by_account.setdefault(opp["account_id"], opp["opp_id"])
        for n in range(1, 94):
            billing_number = 8 + (n - 1) % 83
            customer_id = f"BILL-{billing_number:03d}"
            account_id = self.billing_to_account[customer_id]
            # 76 nine-month schedules + 17 eight-month schedules = 820 filler lines.
            # Every active subscription has a continuous month-by-month schedule.
            starts = date(2025, 10, 1) if n <= 76 else date(2025, 11, 1)
            account_created = date.fromisoformat(self.accounts[account_id]["created_at"][:10])
            if starts <= account_created:
                raise AssertionError(f"Subscription starts before CRM account: {customer_id}")
            annual = self.rng.randrange(24000, 120001, 1200)
            matched_opp = won_by_account.get(account_id, "")
            if matched_opp and self.opps[matched_opp]["closed_at_current"][:10] >= starts.isoformat():
                matched_opp = ""
            sub(f"SUB-{n:04d}", customer_id, matched_opp, starts, annual, self.rng.randrange(12, 90))

        lines: list[tuple[str, date, str]] = []
        for n, monthly in enumerate((10000, 15000, 20000, 25000), 1):
            for month in range(1, 7):
                lines.append((f"SUB-CTRL-{n:03d}", date(2026, month, 1), money(monthly)))
        for n, annual in enumerate((100000, 120000, 140000), 1):
            for month in (5, 6):
                lines.append((f"SUB-WON-APR-{n:03d}", date(2026, month, 1), money((Decimal(annual) / 12).quantize(Decimal("0.01")))))
        filler_lines: list[tuple[str, date, str]] = []
        for n in range(1, 94):
            sub_id = f"SUB-{n:04d}"
            starts = date.fromisoformat(self.subscriptions[sub_id]["starts_on"])
            monthly = money((Decimal(self.subscriptions[sub_id]["annual_contract_value_usd"]) / 12).quantize(Decimal("0.01")))
            cursor = starts
            while cursor <= date(2026, 6, 1):
                filler_lines.append((sub_id, cursor, monthly))
                cursor = add_month(cursor)
        if len(filler_lines) != 820:
            raise AssertionError(f"Expected 820 continuous filler service months, got {len(filler_lines)}")
        lines.extend(filler_lines)
        lines.sort(key=lambda item: (item[1], item[0]))
        for n, (sub_id, service_month, amount) in enumerate(lines, 1):
            posted = datetime.combine(service_month + timedelta(days=25), datetime.min.time(), tzinfo=UTC).replace(hour=12)
            self.add("fin_monthly_service_revenue", {"revenue_line_id": f"REV-{n:05d}", "subscription_id": sub_id, "service_month": service_month.isoformat(), "amount_usd": amount, "posted_at": stamp(posted), "ingested_at": stamp(posted + timedelta(hours=1))})

    def finalize_lifecycle(self) -> None:
        customer_accounts = set(self.billing_to_account.values())
        open_accounts = {r["account_id"] for r in self.rows["crm_opportunities"] if r["stage_current"] in STAGES_OPEN}
        contact_stage = {r["contact_id"]: "LEAD" for r in self.rows["crm_contacts"]}
        for inquiry in self.rows["mkt_inquiries"]:
            contact_id = inquiry["contact_id"]
            if inquiry["first_sql_at"]:
                contact_stage[contact_id] = "SQL"
            elif inquiry["first_mql_at"] and contact_stage[contact_id] == "LEAD":
                contact_stage[contact_id] = "MQL"
        for link in self.rows["crm_opportunity_source_links"]:
            if link["link_role"] == "PRIMARY_SOURCED" and link["inquiry_id"] in self.inquiries:
                contact_stage[self.inquiries[link["inquiry_id"]]["contact_id"]] = "OPPORTUNITY"
        for account in self.rows["crm_accounts"]:
            account_id = account["account_id"]
            account["lifecycle_stage_current"] = "CUSTOMER" if account_id in customer_accounts else "OPPORTUNITY" if account_id in open_accounts else "LEAD"
        for contact in self.rows["crm_contacts"]:
            contact["lifecycle_stage_current"] = "CUSTOMER" if contact["account_id"] in customer_accounts else contact_stage[contact["contact_id"]]

    def build(self) -> dict[str, list[dict[str, str]]]:
        self.owners()
        self.accounts_and_contacts()
        self.campaigns()
        self.opportunities()
        self.field_events()
        self.inquiries_and_touches()
        self.source_links()
        self.finance()
        self.finalize_lifecycle()
        for table, (_, _, expected) in TABLES.items():
            actual = len(self.rows[table])
            if actual != expected:
                raise AssertionError(f"{table}: expected {expected} rows, got {actual}")
        return self.rows


def write_csv(path: Path, fields: list[str], rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def baseline_reports(rows: dict[str, list[dict[str, str]]], output: Path) -> None:
    accounts = {r["account_id"]: r for r in rows["crm_accounts"]}
    opps = {r["opp_id"]: r for r in rows["crm_opportunities"]}
    subs = {r["subscription_id"]: r for r in rows["fin_subscriptions"]}
    maps = {r["external_entity_id"]: r["crm_account_id"] for r in rows["identity_account_links"]}
    apr_mql = [r for r in rows["mkt_inquiries"] if r["first_mql_at"].startswith("2026-04") and accounts[r["account_id"]]["region"] == "US_EAST" and accounts[r["account_id"]]["segment"] == "MID_MARKET" and r["is_test"] == "false"]
    write_csv(output / "reports/baseline/marketing_april_mql_inquiries.csv", ["inquiry_id", "contact_id", "first_mql_at"], [{k: r[k] for k in ("inquiry_id", "contact_id", "first_mql_at")} for r in apr_mql])
    contacts = sorted({r["contact_id"] for r in apr_mql})
    write_csv(output / "reports/baseline/sales_april_mql_contacts.csv", ["contact_id"], [{"contact_id": c} for c in contacts])
    apr_end = dt(2026, 4, 30, 23, 59, 59)
    stage_by_opp: dict[str, tuple[str, str]] = {}
    for event in rows["crm_opportunity_stage_events"]:
        if event["occurred_at"] <= stamp(apr_end):
            stage_by_opp[event["opp_id"]] = (event["occurred_at"], event["to_stage"])
    pipeline = [r for r in rows["crm_opportunities"] if accounts[r["account_id"]]["region"] == "US_EAST" and accounts[r["account_id"]]["segment"] == "MID_MARKET" and stage_by_opp.get(r["opp_id"], ("", ""))[1] in STAGES_OPEN]
    pipeline.sort(key=lambda r: r["opp_id"])
    columns = ["opp_id", "account_id", "opportunity_type", "external_quote_id", "amount_usd"]
    write_csv(output / "reports/baseline/sales_april_open_pipeline.csv", columns, [{k: r[k] for k in columns} for r in pipeline])
    seen_quotes: set[str] = set()
    finance_pipeline = []
    for opp in sorted(pipeline, key=lambda r: (r["created_at"], r["opp_id"])):
        if opp["external_quote_id"] in seen_quotes:
            continue
        seen_quotes.add(opp["external_quote_id"])
        if opp["opportunity_type"] == "NEW_BUSINESS":
            finance_pipeline.append(opp)
    write_csv(output / "reports/baseline/finance_april_new_business_pipeline.csv", columns, [{k: r[k] for k in columns} for r in finance_pipeline])
    won_events = {r["opp_id"]: r["occurred_at"] for r in rows["crm_opportunity_stage_events"] if r["to_stage"] == "CLOSED_WON" and r["occurred_at"].startswith("2026-04")}
    april_won = [opps[k] for k in won_events if accounts[opps[k]["account_id"]]["region"] == "US_EAST" and accounts[opps[k]["account_id"]]["segment"] == "MID_MARKET" and opps[k]["opportunity_type"] == "NEW_BUSINESS"]
    write_csv(output / "reports/baseline/sales_april_bookings_labeled_revenue.csv", ["opp_id", "amount_usd", "closed_won_at"], [{"opp_id": r["opp_id"], "amount_usd": r["amount_usd"], "closed_won_at": won_events[r["opp_id"]]} for r in april_won])
    april_revenue = []
    for line in rows["fin_monthly_service_revenue"]:
        if line["service_month"] != "2026-04-01":
            continue
        sub = subs[line["subscription_id"]]
        account_id = maps[sub["billing_customer_id"]]
        if accounts[account_id]["region"] == "US_EAST" and accounts[account_id]["segment"] == "MID_MARKET":
            april_revenue.append({"revenue_line_id": line["revenue_line_id"], "subscription_id": line["subscription_id"], "amount_usd": line["amount_usd"]})
    write_csv(output / "reports/baseline/finance_april_service_revenue.csv", ["revenue_line_id", "subscription_id", "amount_usd"], april_revenue)


def output_files(rows: dict[str, list[dict[str, str]]], output: Path, seed: int) -> None:
    if output.exists():
        raise FileExistsError(f"Output path already exists: {output}. Choose a new --output path; existing data is never overwritten.")
    output.mkdir(parents=True)
    for name, (subdir, columns, _) in TABLES.items():
        write_csv(output / subdir / f"{name}.csv", columns, rows[name])
    baseline_reports(rows, output)
    (output / "reports/baseline/README.md").write_text(
        "# Existing departmental extracts\n\n"
        "All extracts use US_EAST mid-market records and are derived from the generated source CSVs. "
        "April means 2026-04-01 through 2026-04-30 UTC; pipeline is as of 2026-04-30 23:59:59 UTC.\n\n"
        "- `marketing_april_mql_inquiries.csv`: 24 first-MQL inquiry IDs, including repeat inquiries by four people.\n"
        "- `sales_april_mql_contacts.csv`: 20 distinct contact IDs from those same inquiries.\n"
        "- `sales_april_open_pipeline.csv`: 11 April-end open CRM opportunity rows. The existing Sales export includes renewals and a duplicate quote; total $1,200,000.\n"
        "- `finance_april_new_business_pipeline.csv`: eight distinct valid new-business open opportunities after quote-ID survivorship; total $940,000.\n"
        "- `sales_april_bookings_labeled_revenue.csv`: three April closed-won new-business deals totaling $360,000. The old dashboard calls this revenue, but stakeholders agree it is bookings.\n"
        "- `finance_april_service_revenue.csv`: four subscription service-month lines totaling $70,000. This is the agreed April management service-revenue measure.\n\n"
        "The CSVs contain supporting rows, not precomputed analytical marts. Preserve both source extracts and explain their grain, filters, and meaning.\n",
        encoding="utf-8",
    )
    assignments = output / "assignments"
    assignments.mkdir()
    (assignments / "lead_to_revenue_ssot.md").write_text(
        "# Assignment: Lead-to-Revenue Data Mart / SSOT\n\n"
        "Fiction Cloud Inc.'s Marketing, Sales, and Finance reports differ. Use the source CSVs and existing extracts to build a documented lead-to-revenue analytical layer. "
        "The stakeholders have already agreed that MQL inquiry count and distinct MQL people are separate measures; new-business pipeline excludes renewals and duplicate quote records; "
        "bookings are closed-won contract value; and monthly service revenue comes from Finance's subscription schedule.\n\n"
        "Required controlled outputs: 24 April MQL inquiries, 20 people, six SQLs, three sourced opportunities, one won by June 30, $940,000 new-business open pipeline at April 30, "
        "$360,000 April new-business bookings, and $70,000 April service revenue. Preserve raw records, historical stages, and data-quality exceptions. "
        "Document definitions and demonstrate row-level reconciliation. The method, SQL models, tests, and presentation are the engineer's work.\n",
        encoding="utf-8",
    )
    (output / "business_brief.md").write_text(
        "# Fiction Cloud Inc.\n\n"
        "Fiction Cloud Inc. is a fictional B2B workflow-software company with inbound, sales-led, "
        "and self-service trial motions. The core source records cover 2025-01-01 through 2026-06-30. "
        "All people, organizations, email addresses, and results are synthetic.\n\n"
        "CRM owns operational accounts, contacts, opportunities, and stage history. Marketing owns "
        "inquiries and touches. Finance owns subscriptions and monthly service revenue. "
        "The identity table maps billing customers to CRM accounts. USD is the only currency in core v1.\n\n"
        "The April SSOT case intentionally contains different MQL grains, renewal and duplicate pipeline rows, "
        "and bookings mislabeled as revenue. See reports/baseline and the source specification for agreed definitions.\n",
        encoding="utf-8",
    )
    catalog = ["# Core source catalog", "", "Timestamps are UTC ISO 8601; dates are ISO dates; money is decimal USD with two places.", ""]
    for name, (subdir, columns, count) in TABLES.items():
        catalog += [f"## {name}", "", f"Path: `{subdir}/{name}.csv`  ", f"Rows: {count}  ", f"Columns: {', '.join(f'`{column}`' for column in columns)}", ""]
    (output / "source_catalog.md").write_text("\n".join(catalog), encoding="utf-8")
    private = output / "validation_private"
    private.mkdir()
    oracle = {"april_mql_inquiries": 24, "april_mql_contacts": 20, "april_mql_sql": 6, "april_mql_sourced_opportunities": 3, "april_mql_won_opportunities": 1, "april_sales_open_pipeline_usd": "1200000.00", "april_valid_all_type_pipeline_usd": "1120000.00", "april_new_business_open_pipeline_usd": "940000.00", "april_new_business_bookings_usd": "360000.00", "april_service_revenue_usd": "70000.00", "june_valid_open_opportunities": 20, "june_stale_open_opportunities": 6, "june_slipped_open_opportunities": 4, "june_union_risk_opportunities": 8, "known_defects": ["duplicate external quote on OPP-APR-001 and OPP-APR-011", "unknown stage on OPP-DQ-001", "orphan inquiry on SRC-DQ-001", "duplicate account domain on ACCT-DQ-001 and ACCT-DQ-002", "late recorded stage event on OPP-DQ-002"]}
    (private / "expected_results.json").write_text(json.dumps(oracle, indent=2) + "\n", encoding="utf-8")
    hashes = {str(p.relative_to(output)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(output.rglob("*.csv"))}
    manifest = {"company": "Fiction Cloud Inc.", "schema_version": SCHEMA_VERSION, "generator_version": GENERATOR_VERSION, "seed": seed, "faker_version": version("Faker"), "as_of_utc": stamp(AS_OF), "row_counts": {name: len(rows[name]) for name in TABLES}, "sha256_csv": hashes}
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create Fiction Cloud Inc. core CSV fixtures")
    parser.add_argument("--output", type=Path, required=True, help="A new directory for generated CSV files")
    parser.add_argument("--seed", type=int, default=SEED)
    args = parser.parse_args()
    builder = CaseBuilder(args.seed)
    rows = builder.build()
    output_files(rows, args.output.resolve(), args.seed)
    print(f"Generated {len(TABLES)} core CSV tables in {args.output.resolve()}")
    print("Run: python validate.py --data <output-directory>")


if __name__ == "__main__":
    main()
