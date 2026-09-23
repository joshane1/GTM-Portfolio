WITH CTE1_renamed AS (
    SELECT
        inquiry_id,
        contact_id,
        account_id,
        channel,
        campaign_id,
        submitted_at,
        first_mql_at,
        first_sql_at,
        qualification_status,
        is_test,
        source_updated_at,
        ingested_at
    FROM {{source('raw_marketing', 'mkt_inquiries')}}
),
CTE2_cast AS (
    SELECT 
        inquiry_id,
        contact_id,
        account_id,
        channel,
        campaign_id,
        submitted_at::TIMESTAMP AS submitted_at,
        NULLIF(trim(first_mql_at), '')::TIMESTAMP AS first_mql_at,
        NULLIF(trim(first_sql_at), '')::TIMESTAMP AS first_sql_at,
        qualification_status,
        is_test::BOOLEAN AS is_test,
        source_updated_at::TIMESTAMP AS source_updated_at,
        ingested_at::TIMESTAMP AS ingested_at
    FROM CTE1_renamed
)
SELECT * FROM CTE2_cast