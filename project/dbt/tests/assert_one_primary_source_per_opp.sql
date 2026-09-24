-- Core v1 contract: an opp has at most one resolved PRIMARY_SOURCED link.
-- Returns any opp that breaks it; mart_lead_to_revenue relies on this so MIN(inquiry_id) is never hiding a second source.
SELECT
    opp_id,
    COUNT(*) AS primary_source_link_count
FROM {{ ref('bridge_opportunity_inquiry') }}
WHERE is_resolved
    AND link_role = 'PRIMARY_SOURCED'
GROUP BY opp_id
HAVING COUNT(*) > 1