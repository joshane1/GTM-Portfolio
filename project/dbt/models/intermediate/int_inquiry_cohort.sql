-- Every staged inquiry; keep all 960 so the cohort is a flag, not a filter
WITH inquiries AS (
    SELECT
        inquiry_id,
        contact_id,
        account_id,
        campaign_id,
        channel,
        submitted_at,
        first_mql_at,
        first_sql_at,
        is_test
    FROM {{ ref('stg_mkt_inquiries') }}
),

-- Only the account attributes the cohort rule needs
accounts AS (
    SELECT
        account_id,
        region,
        segment
    FROM {{ ref('dim_account') }}
)

-- Final output: one row per inquiry (960), with the approved April MQL cohort
-- and SQL-by-June-30 status as flags instead of filters.
-- Cohort rule: non-test, US_EAST, MID_MARKET, first MQL'd in April. The window
-- includes Apr 1 and stops before May 1, and submitted_at is never used.
-- Keeping all inquiries means the same model can be reused for other cohorts and
-- any inquiry can be audited for why it's in or out. This fixes the funnel
-- denominator at 24 inquiries (20 people) before any CRM outcomes are attached.
SELECT
    inquiries.inquiry_id,
    inquiries.contact_id,
    inquiries.account_id,
    inquiries.campaign_id,
    inquiries.channel,
    inquiries.submitted_at,
    inquiries.first_mql_at,
    inquiries.first_sql_at,
    accounts.region,
    accounts.segment,
    CASE
        WHEN NOT inquiries.is_test
            AND accounts.region = 'US_EAST'
            AND accounts.segment = 'MID_MARKET'
            AND inquiries.first_mql_at >= TIMESTAMP '2026-04-01 00:00:00'
            AND inquiries.first_mql_at < TIMESTAMP '2026-05-01 00:00:00'
        THEN TRUE ELSE FALSE
    END AS is_april_mql_cohort,
    CASE
        WHEN inquiries.first_sql_at IS NOT NULL
            AND inquiries.first_sql_at <= TIMESTAMP '2026-06-30 23:59:59'
        THEN TRUE ELSE FALSE
    END AS reached_sql_by_cutoff
FROM inquiries
LEFT JOIN accounts
    ON inquiries.account_id = accounts.account_id