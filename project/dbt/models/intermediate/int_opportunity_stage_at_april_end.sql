WITH eligible_events AS (
    SELECT
        opp_id,
        stage_event_id,
        to_stage_raw,
        to_stage_normalized,
        occurred_at,
        recorded_at
    FROM {{ ref('stg_crm_opportunity_stage_events') }}
    WHERE occurred_at <= TIMESTAMP '2026-04-30 23:59:59'
),

ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY opp_id
            ORDER BY occurred_at DESC, stage_event_id DESC
        ) AS event_rank
    FROM eligible_events
)

SELECT
    opp_id,
    stage_event_id,
    to_stage_raw AS stage_apr_30_raw,
    to_stage_normalized AS stage_apr_30,
    occurred_at AS stage_apr_30_at,
    recorded_at
FROM ranked
WHERE event_rank = 1