-- Revenue rolled up to one row per subscription so months can't multiply ACV
WITH revenue_by_subscription AS (
    SELECT
        subscription_id,
        SUM(service_revenue_usd) AS service_revenue_to_date_usd
    FROM {{ ref('fct_monthly_service_revenue') }}
    GROUP BY subscription_id
),

-- Only subscriptions Finance explicitly tied to an opp; blank origins stay unassigned
subscriptions AS (
    SELECT
        subscription_id,
        originating_opp_id,
        starts_on,
        annual_contract_value_usd
    FROM {{ ref('stg_fin_subscriptions') }}
    WHERE originating_opp_id IS NOT NULL
),

-- Subscription grain: each subscription with its total revenue to date
subscription_revenue AS (
    SELECT
        subscriptions.subscription_id,
        subscriptions.originating_opp_id,
        subscriptions.starts_on,
        subscriptions.annual_contract_value_usd,
        revenue_by_subscription.service_revenue_to_date_usd
    FROM subscriptions
    LEFT JOIN revenue_by_subscription
        ON subscriptions.subscription_id = revenue_by_subscription.subscription_id
)

-- Final output: one row per originating opp (12 opps covering 13 subscriptions),
-- with subscription count, first start date, total ACV and service revenue to date.
-- Each one-to-many step is aggregated first: revenue months to subscription, then
-- subscriptions to opp. That lets the lead-to-revenue mart join on opp_id without
-- repeating opps or inflating bookings and ACV. Subscriptions with no stated
-- origin are left out on purpose rather than assigned to a guessed opp.
SELECT
    originating_opp_id,
    COUNT(*) AS subscription_count,
    MIN(starts_on) AS first_subscription_start_date,
    SUM(annual_contract_value_usd) AS total_originated_acv_usd,
    COALESCE(SUM(service_revenue_to_date_usd), 0) AS service_revenue_to_date_usd
FROM subscription_revenue
GROUP BY originating_opp_id