SELECT
    contact_id,
    account_id,
    email,
    persona,
    lifecycle_stage_current,
    created_at
FROM {{ ref('stg_crm_contacts') }}