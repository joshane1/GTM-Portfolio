WITH CTE1_sourced AS (
    SELECT  owner_id,
            team,
            region,
            segment,
            active_from,
            active_to,
            is_available,
            source_updated_at,
            ingested_at
    FROM {{ source('raw_crm', 'crm_owners') }}
),
CTE2_cast AS (
    SELECT  owner_id,
            team,
            region,
            segment,
            active_from::DATE AS active_from,
            active_to::DATE OR NULL AS active_to,
            is_available::BOOLEAN AS is_available,
            source_updated_at::TIMESTAMP AS source_updated_at,
            ingested_at::TIMESTAMP AS ingested_at
    FROM CTE1_sourced
)
SELECT * FROM CTE2_cast