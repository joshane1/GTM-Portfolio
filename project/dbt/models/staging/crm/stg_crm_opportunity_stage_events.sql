WITH CTE1_sourced AS (
    SELECT 
        stage_event_id,
        opp_id,
        from_stage,
        to_stage,
        occurred_at,
        recorded_at,
        ingested_at
    FROM {{ source('raw_crm', 'crm_opportunity_stage_events') }}
),

CTE2_cast AS (
    SELECT 
        stage_event_id,
        opp_id,
        NULLIF(TRIM(from_stage), '') AS from_stage_raw,
        NULLIF(TRIM(to_stage), '') AS to_stage_raw,
        NULLIF(TRIM(occurred_at), '')::TIMESTAMP AS occurred_at,
        NULLIF(TRIM(recorded_at), '')::TIMESTAMP AS recorded_at,
        NULLIF(TRIM(ingested_at), '')::TIMESTAMP AS ingested_at
    FROM CTE1_sourced
),

CTE3_normalized AS (
    SELECT
        stage_event_id,
        opp_id,
        from_stage_raw,
        to_stage_raw,

        CASE
            WHEN from_stage_raw IN ('DISCOVERY','EVALUATION','PROPOSAL','NEGOTIATION','CLOSED_WON','CLOSED_LOST')
            THEN from_stage_raw
            ELSE 'UNKNOWN'
        END AS from_stage_normalized,

        CASE
            WHEN to_stage_raw IN ('DISCOVERY','EVALUATION','PROPOSAL','NEGOTIATION','CLOSED_WON','CLOSED_LOST')
            THEN to_stage_raw
            ELSE 'UNKNOWN'
        END AS to_stage_normalized,
        occurred_at,
        recorded_at,
        ingested_at
    FROM CTE2_cast
)

SELECT *
FROM CTE3_normalized