WITH source_links AS (
    SELECT
        source_link_id,
        opp_id,
        inquiry_id,
        link_role,
        linked_at
    FROM {{ ref('stg_crm_opportunity_source_links') }}
),

opportunities AS (
    SELECT
        opp_id AS matched_opp_id
    FROM {{ ref('stg_crm_opportunities') }}
),

inquiries AS (
    SELECT
        inquiry_id AS matched_inquiry_id
    FROM {{ ref('stg_mkt_inquiries') }}
),

joined AS (
    SELECT
        source_links.source_link_id,
        source_links.opp_id,
        source_links.inquiry_id,
        source_links.link_role,
        source_links.linked_at,
        opportunities.matched_opp_id IS NOT NULL AS opportunity_exists,
        inquiries.matched_inquiry_id IS NOT NULL AS inquiry_exists
    FROM source_links
    LEFT JOIN opportunities ON source_links.opp_id = opportunities.matched_opp_id
    LEFT JOIN inquiries ON source_links.inquiry_id = inquiries.matched_inquiry_id
),

resolved AS (
    SELECT
        source_link_id,
        opp_id,
        inquiry_id,
        link_role,
        linked_at,
        opportunity_exists,
        inquiry_exists,
        opportunity_exists AND inquiry_exists AS is_resolved,
        CASE
            WHEN opportunity_exists AND inquiry_exists THEN NULL
            WHEN NOT opportunity_exists AND NOT inquiry_exists THEN 'BOTH_NOT_FOUND'
            WHEN NOT opportunity_exists THEN 'OPPORTUNITY_NOT_FOUND'
            WHEN NOT inquiry_exists THEN 'INQUIRY_NOT_FOUND'
        END AS issue_reason
    FROM joined
)

SELECT *
FROM resolved