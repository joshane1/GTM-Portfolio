WITH CTE1_renamed AS (
    SELECT
        revenue_line_id,
        subscription_id,
        service_month,
        amount_usd,
        posted_at,
        ingested_at
    FROM {{source('raw_finance', 'fin_monthly_service_revenue')}}
),
CTE2_cast AS (
    SELECT 
        revenue_line_id,
        subscription_id,
        NULLIF(trim(service_month), '')::DATE AS service_month,
        amount_usd::DECIMAL(18, 2) AS service_revenue_usd,
        NULLIF(trim(posted_at), '')::TIMESTAMP AS posted_at,
        ingested_at::TIMESTAMP AS ingested_at
    FROM CTE1_renamed
)
SELECT * FROM CTE2_cast