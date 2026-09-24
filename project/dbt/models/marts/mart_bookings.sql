-- Every CLOSED_WON stage event; stage history dates the win, not the current closed_at field
WITH won_events AS (
    SELECT
        opp_id,
        stage_event_id,
        occurred_at
    FROM {{ ref('stg_crm_opportunity_stage_events') }}
    WHERE to_stage_normalized = 'CLOSED_WON'
),

-- Rank each opp's wins oldest first; event id breaks ties
ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY opp_id
            ORDER BY occurred_at ASC, stage_event_id ASC
        ) AS win_rank
    FROM won_events
),

-- First win per opp, filtered before any join so each opp books once
first_win AS (
    SELECT
        opp_id,
        occurred_at AS booking_at
    FROM ranked
    WHERE win_rank = 1
),

-- Opp type, amount, and quote survivorship for each booking
opportunities AS (
    SELECT
        opp_id,
        account_id,
        opportunity_type,
        amount_usd,
        is_quote_survivor
    FROM {{ ref('fct_opportunity') }}
),

-- Account region and segment for scoping bookings
accounts AS (
    SELECT
        account_id,
        region,
        segment
    FROM {{ ref('dim_account') }}
)

-- Final output: one booking per won opp (71), dated by its first CLOSED_WON event.
-- The booked amount is the CRM opp amount at the win. Region, segment, type and
-- quote survivorship are included so any booking scope can be filtered from this
-- one table. The approved April new-business view (US_EAST, MID_MARKET,
-- NEW_BUSINESS, quote survivor) gives 3 opps / $360k. Using event history
-- instead of the current stage puts each booking in the right period, even if
-- the deal changed stage later. Bookings are contract value at signing, not
-- service revenue.
SELECT
    first_win.opp_id,
    opportunities.account_id,
    opportunities.opportunity_type,
    first_win.booking_at,
    DATE_TRUNC('month', first_win.booking_at) AS booking_month,
    opportunities.amount_usd AS booked_amount_usd,
    accounts.region,
    accounts.segment,
    opportunities.is_quote_survivor
FROM first_win
LEFT JOIN opportunities
    ON first_win.opp_id = opportunities.opp_id
LEFT JOIN accounts
    ON opportunities.account_id = accounts.account_id