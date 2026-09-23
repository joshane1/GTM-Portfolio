WITH CTE1_renamed AS (
    SELECT
        billing_customer_id,
        created_at,
        status,
        source_updated_at,
        ingested_at
    FROM {{source('raw_finance', 'fin_customers')}}
),
CTE2_cast AS (
    SELECT 
        billing_customer_id,
        NULLIF(trim(created_at), '')::TIMESTAMP AS created_at,
        status,
        source_updated_at::TIMESTAMP AS source_updated_at,
        ingested_at::TIMESTAMP AS ingested_at
    FROM CTE1_renamed
)
SELECT * FROM CTE2_cast