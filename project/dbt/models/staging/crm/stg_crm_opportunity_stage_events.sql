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
        NULLIF(trim(from_stage), '') AS from_stage_raw,
        NULLIF(trim(to_stage), '') AS to_stage_raw,
        NULLIF(trim(occurred_at), '')::TIMESTAMP AS occurred_at,
        NULLIF(trim(recorded_at), '')::TIMESTAMP AS recorded_at,
        NULLIF(trim(ingested_at), '')::TIMESTAMP AS ingested_at
    FROM CTE1_sourced
)
SELECT * FROM CTE2_cast