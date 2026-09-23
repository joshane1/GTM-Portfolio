WITH CTE1_renamed AS (
    SELECT
        subscription_id,
        billing_customer_id,
        originating_opp_id,
        starts_on,
        ends_on,
        status,
        annual_contract_value_usd,
        licensed_seats,
        source_updated_at,
        ingested_at
    FROM {{source('raw_finance', 'fin_subscriptions')}}
),
CTE2_cast AS (
    SELECT 
        subscription_id,
        billing_customer_id,
        NULLIF(trim(originating_opp_id), '') AS originating_opp_id,
        NULLIF(trim(starts_on), '')::DATE AS starts_on,
        NULLIF(trim(ends_on), '')::DATE AS ends_on,
        status,
        annual_contract_value_usd::DECIMAL(18, 2) AS annual_contract_value_usd,
        licensed_seats::INTEGER AS licensed_seats,
        source_updated_at::TIMESTAMP AS source_updated_at,
        ingested_at::TIMESTAMP AS ingested_at
    FROM CTE1_renamed
)
SELECT * FROM CTE2_cast