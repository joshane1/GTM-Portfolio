WITH CTE1_sourced AS (
    SELECT
        contact_id,
        account_id,
        email,
        persona,
        created_at,
        lifecycle_stage_current,
        source_updated_at,
        ingested_at
    FROM {{source('raw_crm', 'crm_contacts')}}
),
CTE2_cast AS (
    SELECT
        IFNULL(trim(contact_id), '') AS contact_id,
        IFNULL(trim(account_id), '') AS account_id,
        IFNULL(trim(email), '') AS email,
        IFNULL(trim(persona), '') AS persona,
        created_at::timestamp AS created_at,
        IFNULL(trim(lifecycle_stage_current), '') AS lifecycle_stage_current,
        source_updated_at::timestamp AS source_updated_at,
        ingested_at::timestamp AS ingested_at
    FROM CTE1_sourced
)

SELECT * FROM CTE2_cast