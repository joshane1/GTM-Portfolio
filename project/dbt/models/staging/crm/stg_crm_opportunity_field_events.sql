WITH CTE1_sourced AS (
    SELECT 
        field_event_id,
        opp_id,
        field_name,
        old_value,
        new_value,
        occurred_at,
        recorded_at,
        ingested_at,
    FROM {{ source('raw_crm', 'crm_opportunity_field_events') }}
),

CTE2_cast AS (
    SELECT 
        field_event_id,
        opp_id,
        field_name,
        NULLIF(trim(old_value), '') AS old_value,
        NULLIF(trim(new_value), '') AS  new_value,
        NULLIF(trim(occurred_at), '')::TIMESTAMP AS occurred_at,
        NULLIF(trim(recorded_at), '')::TIMESTAMP AS recorded_at,
        NULLIF(trim(ingested_at), '')::TIMESTAMP AS ingested_at,
    FROM CTE1_sourced
)
SELECT * FROM CTE2_cast