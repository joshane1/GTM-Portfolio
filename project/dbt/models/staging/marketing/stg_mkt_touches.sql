WITH CTE1_renamed AS (
    SELECT
        touch_id,
        inquiry_id,
        contact_id,
        campaign_id,
        channel,
        occurred_at,
        ingested_at
    FROM {{source('raw_marketing', 'mkt_touches')}}
),
CTE2_cast AS (
    SELECT 
        touch_id,
        NULLIF(trim(inquiry_id), '') AS inquiry_id,
        contact_id,
        campaign_id,
        channel,
        occurred_at::TIMESTAMP AS occurred_at,
        ingested_at::TIMESTAMP AS ingested_at
    FROM CTE1_renamed
)
SELECT * FROM CTE2_cast