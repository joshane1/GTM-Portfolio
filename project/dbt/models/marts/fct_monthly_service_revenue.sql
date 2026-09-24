-- All 850 Finance revenue lines; this is the base and its grain must not change
WITH revenue_lines AS (
    SELECT
        revenue_line_id,
        subscription_id,
        service_month,
        service_revenue_usd,
        posted_at
    FROM {{ ref('stg_fin_monthly_service_revenue') }}
),

-- Subscription's billing customer and originating opp (left NULL when Finance didn't supply one)
subscriptions AS (
    SELECT
        subscription_id,
        billing_customer_id,
        originating_opp_id
    FROM {{ ref('stg_fin_subscriptions') }}
),

-- Approved billing customer to CRM account map
identity AS (
    SELECT
        billing_customer_id,
        account_id
    FROM {{ ref('int_account_identity') }}
),

-- CRM region and segment for scoping revenue
accounts AS (
    SELECT
        account_id,
        region,
        segment
    FROM {{ ref('dim_account') }}
)

-- Final output: one row per Finance revenue line (850), linked across systems:
-- revenue line -> subscription -> billing customer -> CRM account.
-- Revenue is Finance's posted service_revenue_usd, not ACV / 12, so it matches
-- the ledger even with proration. LEFT JOINs keep every line, and tests flag any
-- line that fails to resolve to an account. originating_opp_id is left as
-- supplied; blank origins aren't guessed, and that revenue stays reportable
-- at account level. April US_EAST / MID_MARKET gives 4 lines / $70k.
SELECT
    revenue_lines.revenue_line_id,
    revenue_lines.subscription_id,
    subscriptions.billing_customer_id,
    identity.account_id,
    subscriptions.originating_opp_id,
    revenue_lines.service_month,
    revenue_lines.service_revenue_usd,
    revenue_lines.posted_at,
    accounts.region,
    accounts.segment
FROM revenue_lines
LEFT JOIN subscriptions
    ON revenue_lines.subscription_id = subscriptions.subscription_id
LEFT JOIN identity
    ON subscriptions.billing_customer_id = identity.billing_customer_id
LEFT JOIN accounts
    ON identity.account_id = accounts.account_id