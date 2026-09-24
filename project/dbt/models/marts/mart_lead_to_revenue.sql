-- All 240 opps; the base relation and the grain of this mart
WITH opportunities AS (
    SELECT
        opp_id,
        account_id,
        opportunity_type,
        amount_usd,
        stage_normalized,
        stage_apr_30
    FROM {{ ref('fct_opportunity') }}
),

-- Account context for each opp
accounts AS (
    SELECT
        account_id,
        account_name,
        region,
        segment
    FROM {{ ref('dim_account') }}
),

-- Primary sourced inquiry per opp; grouped so a second link can't fan out the join
-- (assert_one_primary_source_per_opp fails if one ever appears)
primary_source AS (
    SELECT
        opp_id,
        MIN(inquiry_id) AS primary_sourced_inquiry_id
    FROM {{ ref('bridge_opportunity_inquiry') }}
    WHERE is_resolved
        AND link_role = 'PRIMARY_SOURCED'
    GROUP BY opp_id
),

-- First-win booking per opp; already one row per won opp
bookings AS (
    SELECT
        opp_id,
        booking_at,
        booked_amount_usd
    FROM {{ ref('mart_bookings') }}
),

-- Finance outcomes already rolled up to one row per originating opp
finance_outcomes AS (
    SELECT
        originating_opp_id,
        subscription_count,
        first_subscription_start_date,
        total_originated_acv_usd,
        service_revenue_to_date_usd
    FROM {{ ref('int_revenue_by_originating_opportunity') }}
)

-- Final output: one row per opp (240) tracing lead -> opp -> booking -> revenue.
-- Every input is already one row per opp, so each LEFT JOIN keeps the grain at 240.
-- Missing numeric outcomes become 0 so totals and rates work; missing inquiry IDs
-- and dates stay NULL, meaning "no link" rather than a zero value. Revenue only
-- attaches where Finance named the originating opp. Blank-origin revenue isn't
-- forced onto an opp and stays in fct_monthly_service_revenue at account level.
-- This is the single table for answering which leads turned into bookings and
-- revenue, without overstating attribution.
SELECT
    opportunities.opp_id,
    opportunities.account_id,
    accounts.account_name,
    accounts.region,
    accounts.segment,
    opportunities.opportunity_type,
    opportunities.amount_usd,
    opportunities.stage_normalized,
    opportunities.stage_apr_30,
    primary_source.primary_sourced_inquiry_id,
    bookings.booking_at,
    COALESCE(bookings.booked_amount_usd, 0) AS booked_amount_usd,
    COALESCE(finance_outcomes.subscription_count, 0) AS subscription_count,
    finance_outcomes.first_subscription_start_date,
    COALESCE(finance_outcomes.total_originated_acv_usd, 0) AS total_originated_acv_usd,
    COALESCE(finance_outcomes.service_revenue_to_date_usd, 0) AS service_revenue_to_date_usd
FROM opportunities
LEFT JOIN accounts
    ON opportunities.account_id = accounts.account_id
LEFT JOIN primary_source
    ON opportunities.opp_id = primary_source.opp_id
LEFT JOIN bookings
    ON opportunities.opp_id = bookings.opp_id
LEFT JOIN finance_outcomes
    ON opportunities.opp_id = finance_outcomes.originating_opp_id