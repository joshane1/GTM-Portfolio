WITH accounts AS (
    SELECT
        account_id,
        account_name,
        domain,
        segment,
        region,
        industry,
        lifecycle_stage_current,
        created_at
    FROM {{ ref('stg_crm_accounts') }}
),

identity AS (
    SELECT
        account_id,
        billing_customer_id
    FROM {{ ref('int_account_identity') }}
)

SELECT
    accounts.account_id,
    accounts.account_name,
    accounts.domain,
    accounts.segment,
    accounts.region,
    accounts.industry,
    accounts.lifecycle_stage_current,
    accounts.created_at,
    identity.billing_customer_id
FROM accounts
LEFT JOIN identity
    ON accounts.account_id = identity.account_id