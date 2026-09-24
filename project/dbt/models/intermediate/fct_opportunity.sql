WITH opportunities AS (
    SELECT
        opp_id,
        account_id,
        owner_id,
        opportunity_type,
        stage_raw,
        stage_normalized,
        amount_usd,
        created_at,
        expected_close_date,
        closed_at,
        external_quote_id
    FROM {{ ref('stg_crm_opportunities') }}
),

april_stage AS (
    SELECT
        opp_id,
        stage_apr_30_raw,
        stage_apr_30
    FROM {{ ref('int_opportunity_stage_at_april_end') }}
),

quote_survivorship AS (
    SELECT
        opp_id,
        duplicate_rank,
        quote_record_count,
        is_quote_survivor
    FROM {{ ref('int_quote_survivorship') }}
)

SELECT
    opportunities.opp_id,
    opportunities.account_id,
    opportunities.owner_id,
    opportunities.opportunity_type,
    opportunities.stage_raw,
    opportunities.stage_normalized,
    april_stage.stage_apr_30_raw,
    april_stage.stage_apr_30,
    opportunities.amount_usd,
    opportunities.created_at,
    opportunities.expected_close_date,
    opportunities.closed_at,
    opportunities.external_quote_id,
    quote_survivorship.duplicate_rank,
    quote_survivorship.quote_record_count,
    quote_survivorship.is_quote_survivor
FROM opportunities
LEFT JOIN april_stage ON opportunities.opp_id = april_stage.opp_id
LEFT JOIN quote_survivorship ON opportunities.opp_id = quote_survivorship.opp_id