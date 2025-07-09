/*
  # Fix Ambiguous Column Reference in Webhook

  1. Changes
    - Add explicit table aliases to SQL queries in webhook functions
    - Fix ambiguous column references for subscription_status
*/

-- This migration doesn't modify the schema but is included for documentation purposes
-- The actual fix is in the webhook function code
SELECT 'Fix applied in webhook function code';