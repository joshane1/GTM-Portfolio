WITH links AS (
SELECT * FROM {{ ref('stg_identity_account_links') }}
),

crm_accounts AS (
SELECT account_id FROM {{ ref('stg_crm_accounts') }}
),

billing_customers AS (
SELECT billing_customer_id FROM {{ ref('stg_fin_customers') }}
)

SELECT
    l.link_id, 
    ca.account_id, 
    bc.billing_customer_id, 
    l.valid_from, 
    l.valid_to,
    l.match_status
FROM links l
INNER JOIN crm_accounts ca ON l.account_id = ca.account_id
INNER JOIN billing_customers bc ON l.billing_customer_id = bc.billing_customer_id
WHERE l.valid_from <= '2026-06-30 23:59:59' AND (l.valid_to IS NULL OR l.valid_to >= '2026-06-30 23:59:59')