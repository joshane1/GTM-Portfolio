WITH opportunities AS (
    SELECT
        opp_id,
        external_quote_id,
        created_at,
        CASE
            WHEN external_quote_id IS NULL THEN opp_id
            ELSE external_quote_id
        END AS quote_partition_key
    FROM {{ ref('stg_crm_opportunities') }}
),

ranked AS (
    SELECT
        opp_id,
        external_quote_id,
        ROW_NUMBER() OVER (PARTITION BY quote_partition_key ORDER BY created_at ASC, opp_id ASC) AS duplicate_rank,
        COUNT(*) OVER (PARTITION BY quote_partition_key) AS quote_record_count
    FROM opportunities
)

SELECT
    opp_id,
    external_quote_id,
    duplicate_rank,
    quote_record_count,
    duplicate_rank = 1 AS is_quote_survivor
FROM ranked