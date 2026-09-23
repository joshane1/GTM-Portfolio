WITH CTE1_renamed AS (
    SELECT
        link_id,
        crm_account_id,
        external_system,
        external_entity_id,
        valid_from,
        valid_to,
        match_status,
        source_updated_at,
        ingested_at
    FROM {{source('raw_identity', 'identity_account_links')}}
),
CTE2_cast AS (
    SELECT 
        link_id,
        crm_account_id AS account_id,
        external_system,
        external_entity_id AS billing_customer_id,
        NULLIF(trim(valid_from), '')::TIMESTAMP AS valid_from,
        NULLIF(trim(valid_to), '')::TIMESTAMP AS valid_to,
        match_status,
        source_updated_at::TIMESTAMP AS source_updated_at,
        ingested_at::TIMESTAMP AS ingested_at
    FROM CTE1_renamed
)
SELECT * FROM CTE2_cast