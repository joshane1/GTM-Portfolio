WITH CTE1_sourced AS (
    SELECT 
        source_link_id,
        opp_id,
        inquiry_id,
        link_role,
        linked_at,
        ingested_at
    FROM {{ source('raw_crm', 'crm_opportunity_source_links') }}
),

CTE2_cast AS (
    SELECT 
        source_link_id,
        opp_id,
        NULLIF(trim(inquiry_id), '') AS inquiry_id,
        link_role,
        NULLIF(trim(linked_at), '')::TIMESTAMP AS linked_at,
        NULLIF(trim(ingested_at), '')::TIMESTAMP AS ingested_at
    FROM CTE1_sourced
)
SELECT * FROM CTE2_cast