# Existing departmental extracts

All extracts use US_EAST mid-market records and are derived from the generated source CSVs. April means 2026-04-01 through 2026-04-30 UTC; pipeline is as of 2026-04-30 23:59:59 UTC.

- `marketing_april_mql_inquiries.csv`: 24 first-MQL inquiry IDs, including repeat inquiries by four people.
- `sales_april_mql_contacts.csv`: 20 distinct contact IDs from those same inquiries.
- `sales_april_open_pipeline.csv`: 11 April-end open CRM opportunity rows. The existing Sales export includes renewals and a duplicate quote; total $1,200,000.
- `finance_april_new_business_pipeline.csv`: eight distinct valid new-business open opportunities after quote-ID survivorship; total $940,000.
- `sales_april_bookings_labeled_revenue.csv`: three April closed-won new-business deals totaling $360,000. The old dashboard calls this revenue, but stakeholders agree it is bookings.
- `finance_april_service_revenue.csv`: four subscription service-month lines totaling $70,000. This is the agreed April management service-revenue measure.

The CSVs contain supporting rows, not precomputed analytical marts. Preserve both source extracts and explain their grain, filters, and meaning.
