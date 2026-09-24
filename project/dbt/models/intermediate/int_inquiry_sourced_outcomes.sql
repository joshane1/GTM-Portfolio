-- Resolved PRIMARY_SOURCED links only; influenced and orphan links stay out
WITH primary_links AS (
    SELECT
        inquiry_id,
        opp_id
    FROM {{ ref('bridge_opportunity_inquiry') }}
    WHERE is_resolved
        AND link_role = 'PRIMARY_SOURCED'
),

-- Stage events that happened on or before the June 30 cutoff
eligible_events AS (
    SELECT
        opp_id,
        stage_event_id,
        to_stage_normalized,
        occurred_at
    FROM {{ ref('stg_crm_opportunity_stage_events') }}
    WHERE occurred_at <= TIMESTAMP '2026-06-30 23:59:59'
),

-- Rank each opp's events newest first; event id breaks ties
ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY opp_id
            ORDER BY occurred_at DESC, stage_event_id DESC
        ) AS event_rank
    FROM eligible_events
),

-- Stage each opp was in at June end
june_stage AS (
    SELECT
        opp_id,
        to_stage_normalized AS stage_jun_30
    FROM ranked
    WHERE event_rank = 1
)

-- Final output: one row per inquiry that sourced at least one opp, with how many
-- opps it sourced and how many were CLOSED_WON as of June 30.
-- The LEFT JOIN keeps opps with no stage event yet: they count as sourced but not won.
-- Grouping by inquiry here, before the funnel join, stops an inquiry with several
-- opps from being duplicated in the mart. Using the June-end stage instead of the
-- current stage keeps won counts tied to the reporting cutoff.
SELECT
    primary_links.inquiry_id,
    COUNT(DISTINCT primary_links.opp_id) AS sourced_opportunity_count,
    COUNT(DISTINCT primary_links.opp_id) FILTER (
        WHERE june_stage.stage_jun_30 = 'CLOSED_WON'
    ) AS won_sourced_opportunity_count
FROM primary_links
LEFT JOIN june_stage
    ON primary_links.opp_id = june_stage.opp_id
GROUP BY primary_links.inquiry_id