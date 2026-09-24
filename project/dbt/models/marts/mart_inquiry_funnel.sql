-- All 960 inquiries with cohort and SQL flags; this is the base population
WITH cohort AS (
    SELECT
        inquiry_id,
        contact_id,
        account_id,
        campaign_id,
        channel,
        submitted_at,
        first_mql_at,
        first_sql_at,
        region,
        segment,
        is_april_mql_cohort,
        reached_sql_by_cutoff
    FROM {{ ref('int_inquiry_cohort') }}
),

-- Sourced and won opp counts, already one row per inquiry so the join can't fan out
outcomes AS (
    SELECT
        inquiry_id,
        sourced_opportunity_count,
        won_sourced_opportunity_count
    FROM {{ ref('int_inquiry_sourced_outcomes') }}
)

-- Final output: dashboard-ready inquiry funnel, one row per inquiry (960).
-- Every inquiry is kept, and inquiries with no sourced opps get 0 counts instead
-- of NULL, so sums and rates work without extra handling. IDs and timestamps are
-- left as they are.
-- Filtering to is_april_mql_cohort gives the approved controls: 24 inquiries,
-- 20 people, 6 SQL, 3 sourced opps, 1 won. Each rate uses the previous stage as
-- its denominator: 25% to SQL, 50% to opp, 33.3% to won. Marketing and Sales can
-- tie out their numbers here, down to the individual inquiry.
SELECT
    cohort.inquiry_id,
    cohort.contact_id,
    cohort.account_id,
    cohort.campaign_id,
    cohort.channel,
    cohort.submitted_at,
    cohort.first_mql_at,
    cohort.first_sql_at,
    cohort.region,
    cohort.segment,
    cohort.is_april_mql_cohort,
    cohort.reached_sql_by_cutoff,
    COALESCE(outcomes.sourced_opportunity_count, 0) AS sourced_opportunity_count,
    COALESCE(outcomes.won_sourced_opportunity_count, 0) AS won_sourced_opportunity_count
FROM cohort
LEFT JOIN outcomes
    ON cohort.inquiry_id = outcomes.inquiry_id