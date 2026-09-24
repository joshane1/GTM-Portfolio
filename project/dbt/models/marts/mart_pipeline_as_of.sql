-- All 240 opps with April-end stage and quote survivorship already attached
WITH opportunities AS (
    SELECT
        opp_id,
        account_id,
        owner_id,
        opportunity_type,
        external_quote_id,
        amount_usd,
        stage_apr_30,
        duplicate_rank,
        quote_record_count,
        is_quote_survivor
    FROM {{ ref('fct_opportunity') }}
),

-- Account region and segment for the US_EAST / MID_MARKET scope check
accounts AS (
    SELECT
        account_id,
        account_name,
        region,
        segment
    FROM {{ ref('dim_account') }}
),

-- One row per opp with its account context; no filtering so exclusions stay visible
base AS (
    SELECT
        opportunities.opp_id,
        opportunities.account_id,
        accounts.account_name,
        opportunities.owner_id,
        opportunities.opportunity_type,
        opportunities.external_quote_id,
        opportunities.amount_usd,
        opportunities.stage_apr_30,
        opportunities.duplicate_rank,
        opportunities.quote_record_count,
        opportunities.is_quote_survivor,
        accounts.region,
        accounts.segment
    FROM opportunities
    LEFT JOIN accounts
        ON opportunities.account_id = accounts.account_id
),

-- Sales' raw view: target segment and open at April end (NULL stage counts as not open)
raw_scope AS (
    SELECT
        *,
        CASE
            WHEN region = 'US_EAST'
                AND segment = 'MID_MARKET'
                AND stage_apr_30 IN ('DISCOVERY', 'EVALUATION', 'PROPOSAL', 'NEGOTIATION')
            THEN TRUE ELSE FALSE
        END AS in_raw_sales_pipeline
    FROM base
),

-- Valid pipeline: raw scope minus duplicate quote records
valid_scope AS (
    SELECT
        *,
        in_raw_sales_pipeline AND is_quote_survivor AS in_valid_all_type_pipeline
    FROM raw_scope
),

-- Approved pipeline: valid scope limited to new business
new_business_scope AS (
    SELECT
        *,
        in_valid_all_type_pipeline
            AND opportunity_type = 'NEW_BUSINESS'
            AS in_new_business_pipeline
    FROM valid_scope
)

-- Final output: one row per opp (240) with three nested April-end pipeline flags,
-- as of 2026-04-30 23:59:59 UTC. Each flag is built on the one before it:
-- raw Sales (11 / $1.20m) -> valid all-type (10 / $1.12m) -> approved new business
-- (8 / $940k), so a narrower scope can never include a row the wider one dropped.
-- pipeline_inclusion_reason gives each opp one primary reason, checked in order:
-- scope, then duplicate quote, then type. This lets Sales and Finance see exactly
-- which records separate their numbers instead of arguing over totals. Nothing
-- is filtered out, so every exclusion can be tested and audited.
SELECT
    opp_id,
    account_id,
    account_name,
    owner_id,
    opportunity_type,
    external_quote_id,
    amount_usd,
    stage_apr_30,
    duplicate_rank,
    quote_record_count,
    is_quote_survivor,
    region,
    segment,
    in_raw_sales_pipeline,
    in_valid_all_type_pipeline,
    in_new_business_pipeline,
    CASE
        WHEN NOT in_raw_sales_pipeline THEN 'OUTSIDE_APRIL_SALES_SCOPE'
        WHEN NOT is_quote_survivor THEN 'DUPLICATE_QUOTE'
        WHEN opportunity_type <> 'NEW_BUSINESS' THEN 'NON_NEW_BUSINESS'
        ELSE 'INCLUDED_NEW_BUSINESS'
    END AS pipeline_inclusion_reason
FROM new_business_scope