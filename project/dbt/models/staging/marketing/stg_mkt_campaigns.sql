WITH CTE1_renamed AS (
    SELECT
        campaign_id,
        name,
        channel,
        starts_at,
        ends_at,
        source_updated_at,
        ingested_at
    FROM {{source('raw_marketing', 'mkt_campaigns')}}
),
CTE2_cast AS (
    SELECT 
        campaign_id,
        name AS campaign_name,
        channel,
        NULLIF(trim(starts_at), '')::DATE AS starts_at,
        NULLIF(trim(ends_at), '')::DATE OR NULL AS ends_at,
        source_updated_at::TIMESTAMP AS source_updated_at,
        ingested_at::TIMESTAMP AS ingested_at
    FROM CTE1_renamed
)
SELECT * FROM CTE2_cast