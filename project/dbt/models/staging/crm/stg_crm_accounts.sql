WITH CTE1_renamed AS (
    SELECT
        account_id,
        name AS account_name,
        domain,
        segment,
        region,
        industry,
        created_at,
        lifecycle_stage_current,
        source_updated_at,
        ingested_at
    FROM {{source('raw_crm', 'crm_accounts')}}
),
CTE2_cast AS (
    SELECT 
        NULLIF(trim(account_id), '') AS account_id,
        NULLIF(trim(account_name), '') AS account_name,
        NULLIF(trim(domain), '') AS domain,
        NULLIF(trim(segment), '') AS segment,
        NULLIF(trim(region), '') AS region,
        NULLIF(trim(industry), '') AS industry,
        created_at::timestamp AS created_at,
        NULLIF(trim(lifecycle_stage_current), '') AS lifecycle_stage_current,
        source_updated_at::timestamp AS source_updated_at,
        ingested_at::timestamp AS ingested_at
    FROM CTE1_renamed
)
SELECT * FROM CTE2_cast