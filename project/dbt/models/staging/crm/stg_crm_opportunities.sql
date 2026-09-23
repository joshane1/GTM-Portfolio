WITH CTE1_sourced AS (
    SELECT 
        opp_id,
        account_id,
        owner_id,
        opportunity_type,
        stage_current,
        amount_usd,
        created_at,
        expected_close_date_current,
        closed_at_current,
        external_quote_id,
        source_updated_at,
        ingested_at
    FROM {{ source('raw_crm', 'crm_opportunities') }}
),
CTE2_cast AS (
    SELECT
        opp_id,
        account_id,
        owner_id,
        opportunity_type,
        stage_current AS stage_raw,
        CASE 
            WHEN stage_current IN('DISCOVERY', 'EVALUATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON','CLOSED_LOST') THEN stage_current
            ELSE 'UNKNOWN'
        END AS stage_normalized,
        amount_usd::DECIMAL(18,2) AS amount_usd,
        created_at::TIMESTAMP AS created_at,
        expected_close_date_current::DATE AS expected_close_date,
        closed_at_current::TIMESTAMP OR NULL AS closed_at,
        external_quote_id,
        source_updated_at,
        ingested_at
    FROM CTE1_sourced
)

SELECT * FROM CTE2_cast