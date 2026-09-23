# Core source catalog

Timestamps are UTC ISO 8601; dates are ISO dates; money is decimal USD with two places.

## crm_accounts

Path: `raw/crm/crm_accounts.csv`  
Rows: 240  
Columns: `account_id`, `name`, `domain`, `segment`, `region`, `industry`, `created_at`, `lifecycle_stage_current`, `source_updated_at`, `ingested_at`

## crm_contacts

Path: `raw/crm/crm_contacts.csv`  
Rows: 720  
Columns: `contact_id`, `account_id`, `email`, `persona`, `created_at`, `lifecycle_stage_current`, `source_updated_at`, `ingested_at`

## crm_owners

Path: `raw/crm/crm_owners.csv`  
Rows: 16  
Columns: `owner_id`, `team`, `region`, `segment`, `active_from`, `active_to`, `is_available`, `source_updated_at`, `ingested_at`

## crm_opportunities

Path: `raw/crm/crm_opportunities.csv`  
Rows: 240  
Columns: `opp_id`, `account_id`, `owner_id`, `opportunity_type`, `stage_current`, `amount_usd`, `created_at`, `expected_close_date_current`, `closed_at_current`, `external_quote_id`, `source_updated_at`, `ingested_at`

## crm_opportunity_source_links

Path: `raw/crm/crm_opportunity_source_links.csv`  
Rows: 180  
Columns: `source_link_id`, `opp_id`, `inquiry_id`, `link_role`, `linked_at`, `ingested_at`

## crm_opportunity_stage_events

Path: `raw/crm/crm_opportunity_stage_events.csv`  
Rows: 900  
Columns: `stage_event_id`, `opp_id`, `from_stage`, `to_stage`, `occurred_at`, `recorded_at`, `ingested_at`

## crm_opportunity_field_events

Path: `raw/crm/crm_opportunity_field_events.csv`  
Rows: 450  
Columns: `field_event_id`, `opp_id`, `field_name`, `old_value`, `new_value`, `occurred_at`, `recorded_at`, `ingested_at`

## mkt_inquiries

Path: `raw/marketing/mkt_inquiries.csv`  
Rows: 960  
Columns: `inquiry_id`, `contact_id`, `account_id`, `channel`, `campaign_id`, `submitted_at`, `first_mql_at`, `first_sql_at`, `qualification_status`, `is_test`, `source_updated_at`, `ingested_at`

## mkt_touches

Path: `raw/marketing/mkt_touches.csv`  
Rows: 3000  
Columns: `touch_id`, `inquiry_id`, `contact_id`, `campaign_id`, `channel`, `occurred_at`, `ingested_at`

## mkt_campaigns

Path: `raw/marketing/mkt_campaigns.csv`  
Rows: 24  
Columns: `campaign_id`, `name`, `channel`, `starts_at`, `ends_at`, `source_updated_at`, `ingested_at`

## fin_customers

Path: `raw/finance/fin_customers.csv`  
Rows: 90  
Columns: `billing_customer_id`, `created_at`, `status`, `source_updated_at`, `ingested_at`

## fin_subscriptions

Path: `raw/finance/fin_subscriptions.csv`  
Rows: 100  
Columns: `subscription_id`, `billing_customer_id`, `originating_opp_id`, `starts_on`, `ends_on`, `status`, `annual_contract_value_usd`, `licensed_seats`, `source_updated_at`, `ingested_at`

## fin_monthly_service_revenue

Path: `raw/finance/fin_monthly_service_revenue.csv`  
Rows: 850  
Columns: `revenue_line_id`, `subscription_id`, `service_month`, `amount_usd`, `posted_at`, `ingested_at`

## identity_account_links

Path: `raw/identity/identity_account_links.csv`  
Rows: 90  
Columns: `link_id`, `crm_account_id`, `external_system`, `external_entity_id`, `valid_from`, `valid_to`, `match_status`, `source_updated_at`, `ingested_at`
