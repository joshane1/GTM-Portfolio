-- Raw Sales view: target segment and open at April end, before any cleanup
WITH raw_sales AS (
    SELECT
        'RAW_SALES' AS scope,
        COUNT(*) AS opportunity_count,
        SUM(amount_usd) AS pipeline_amount_usd
    FROM {{ ref('mart_pipeline_as_of') }}
    WHERE in_raw_sales_pipeline
),

-- Raw scope with duplicate quote records removed
valid_all_type AS (
    SELECT
        'VALID_ALL_TYPE' AS scope,
        COUNT(*) AS opportunity_count,
        SUM(amount_usd) AS pipeline_amount_usd
    FROM {{ ref('mart_pipeline_as_of') }}
    WHERE in_valid_all_type_pipeline
),

-- Valid scope limited to new business; this is the approved number
approved_new_business AS (
    SELECT
        'APPROVED_NEW_BUSINESS' AS scope,
        COUNT(*) AS opportunity_count,
        SUM(amount_usd) AS pipeline_amount_usd
    FROM {{ ref('mart_pipeline_as_of') }}
    WHERE in_new_business_pipeline
)

-- Final output: three-row summary of how Sales' $1.20m becomes the approved $940k.
-- Expected: RAW_SALES 11 / $1.20m, VALID_ALL_TYPE 10 / $1.12m,
-- APPROVED_NEW_BUSINESS 8 / $940k. This is only a presentation summary for the
-- README and evidence pack; mart_pipeline_as_of stays the row-level source of
-- truth, so each step down can be traced back to specific opps.
SELECT * FROM raw_sales
UNION ALL
SELECT * FROM valid_all_type
UNION ALL
SELECT * FROM approved_new_business